# Architecture & Implementation Plan - TDC e-Asset MVP

TDC e-Asset คือระบบบริหารจัดการครุภัณฑ์ภายในหน่วยงาน สำหรับติดตามฮาร์ดแวร์ไอที (คอมพิวเตอร์, โน้ตบุ๊ก, จอภาพ, อุปกรณ์ต่อพ่วง, เซิร์ฟเวอร์) พร้อมระบบยืม-คืนย้อนหลัง
ระบบพัฒนาด้วย **Next.js (App Router)**, **Tailwind CSS**, **shadcn/ui**, **Server Actions**, **Supabase (PostgreSQL + Auth)** และ Deploy บน **Vercel** ทั้งหมดบน Free Tier

---

## 1. Database Schema & RLS Policies (PostgreSQL)

```sql
-- Custom Enums
CREATE TYPE asset_status AS ENUM ('available', 'borrowed', 'maintenance');
CREATE TYPE transaction_type AS ENUM ('borrow', 'return');

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Assets Table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0 AND available_quantity <= quantity),
  status asset_status NOT NULL DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  borrower_name TEXT NOT NULL,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories are viewable by authenticated users" 
ON categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" 
ON categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assets Policies
CREATE POLICY "Assets are viewable by authenticated users" 
ON assets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage assets" 
ON assets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Transactions Policies
CREATE POLICY "Transactions are viewable by authenticated users" 
ON transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert transactions" 
ON transactions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 2. Race-Safe Stock Management (Postgres Stored Procedures / RPC)

```sql
-- Borrow Asset RPC Function
CREATE OR REPLACE FUNCTION borrow_asset(
  p_asset_id UUID,
  p_borrower_name TEXT,
  p_amount INT,
  p_created_by UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_available INT;
  v_total INT;
  v_transaction_id UUID;
BEGIN
  -- Row-level lock to prevent concurrent race condition
  SELECT available_quantity, quantity INTO v_available, v_total
  FROM assets
  WHERE id = p_asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  IF v_available < p_amount THEN
    RAISE EXCEPTION 'Insufficient available quantity (% available, % requested)', v_available, p_amount;
  END IF;

  -- Update Stock & Status
  UPDATE assets
  SET 
    available_quantity = available_quantity - p_amount,
    status = CASE 
      WHEN (available_quantity - p_amount) = 0 THEN 'borrowed'::asset_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_asset_id;

  -- Create Transaction Record
  INSERT INTO transactions (asset_id, borrower_name, type, amount, note, created_by)
  VALUES (p_asset_id, p_borrower_name, 'borrow', p_amount, p_note, p_created_by)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Return Asset RPC Function
CREATE OR REPLACE FUNCTION return_asset(
  p_asset_id UUID,
  p_borrower_name TEXT,
  p_amount INT,
  p_created_by UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_available INT;
  v_total INT;
  v_status asset_status;
  v_transaction_id UUID;
BEGIN
  -- Row-level lock
  SELECT available_quantity, quantity, status INTO v_available, v_total, v_status
  FROM assets
  WHERE id = p_asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  IF (v_available + p_amount) > v_total THEN
    RAISE EXCEPTION 'Returned amount exceeds maximum asset limit';
  END IF;

  -- Update Stock & Status
  UPDATE assets
  SET 
    available_quantity = available_quantity + p_amount,
    status = CASE 
      WHEN v_status != 'maintenance' AND (available_quantity + p_amount) > 0 THEN 'available'::asset_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_asset_id;

  -- Create Transaction Record
  INSERT INTO transactions (asset_id, borrower_name, type, amount, note, created_by)
  VALUES (p_asset_id, p_borrower_name, 'return', p_amount, p_note, p_created_by)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. Directory Architecture

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx            # Login Page (Magic link / Email OTP)
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts        # OAuth / OTP Callback Route
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Admin Header & Navigation Layout
│   │   ├── page.tsx                # M8: Dashboard (4 summary cards + 10 recent transactions)
│   │   ├── assets/
│   │   │   ├── page.tsx            # M6: Asset list table & filter
│   │   │   ├── new/page.tsx        # M6: Create asset form
│   │   │   └── [id]/page.tsx       # M6/M7: Asset detail & borrow/return modal
│   │   └── categories/
│   │       └── page.tsx            # M6: Category list & quick add dialog
│   ├── page.tsx                    # Public Landing Page
│   ├── layout.tsx                  # Root Layout
│   └── globals.css                 # Tailwind v4 globals
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── layout/                     # Navbar, Sidebar, UserMenu
│   ├── dashboard/                  # StatCards, RecentTransactionsTable
│   ├── assets/                     # AssetTable, AssetForm, BorrowDialog, ReturnDialog
│   └── categories/                 # CategoryTable, CategoryForm
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client (@supabase/ssr)
│   │   ├── server.ts               # Server client (@supabase/ssr)
│   │   └── middleware.ts           # Middleware auth refresh helper
│   ├── types/
│   │   └── database.types.ts       # Supabase auto-generated types
│   └── utils.ts                    # Utility functions (cn, date formatters)
├── actions/
│   ├── auth.ts                     # signInWithOtp, signOut Server Actions
│   ├── assets.ts                   # createAsset, updateAsset, deleteAsset Server Actions
│   ├── categories.ts               # createCategory, deleteCategory Server Actions
│   └── transactions.ts             # borrowAssetAction, returnAssetAction RPC Server Actions
└── middleware.ts                   # Global Auth Guard Middleware
```

---

## 4. Phased Implementation Plan (Workshop Milestones M4 - M8)

### Milestone M4: Database & Environment Setup
- Config `.env.local` with Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Execute Supabase Migration SQL (Tables `profiles`, `categories`, `assets`, `transactions`, RLS, and Indexes)
- Export DB schema types to `src/lib/types/database.types.ts`

### Milestone M5: Auth & Middleware Security
- Implement Supabase SSR helpers in `src/lib/supabase/`
- Build Login UI & Passwordless Magic Link Server Action in `src/actions/auth.ts`
- Setup Auth Callback Handler (`src/app/(auth)/auth/callback/route.ts`)
- Configure `middleware.ts` to block unauthenticated users from `/(dashboard)/*` and allow public access to `/` and `/login`

### Milestone M6: Asset & Category CRUD (Server Actions)
- Scaffold shadcn/ui components (`table`, `dialog`, `button`, `input`, `select`, `card`)
- Build Category Server Actions & UI (`src/actions/categories.ts`)
- Build Asset CRUD Server Actions & UI (`src/actions/assets.ts`) with string field `image_url`

### Milestone M7: Borrow-Return & Race-Safe Stock Management
- Apply Postgres Functions `borrow_asset` & `return_asset` in Supabase
- Create RPC invocation Server Actions (`src/actions/transactions.ts`) with explicit error handling & revalidation
- Add Borrow/Return modals with quantity checks to Asset detail/table pages

### Milestone M8: Dashboard & Key Performance Indicators
- Build 4 KPI summary cards (Total Assets, Available, Borrowed, Maintenance)
- Query and display top 10 most recent transactions with relative timestamps
- Perform full E2E validation of MVP user journey

---

## 5. Technical Risk Analysis & Mitigation Strategies

| Risk Area | Risk Level | Description | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Race Condition** | **HIGH** | Multiple admins borrowing the same asset concurrently resulting in negative stock. | Handled at DB level using `FOR UPDATE` row lock inside Postgres RPC function (`borrow_asset`). |
| **Supabase Free Tier Rate Limit** | **MEDIUM** | Auth Magic Link email limit (3 emails/hour on default SMTP). | Recommend setting up custom SMTP (e.g. Resend free tier) or using test OTP credentials during demo. |
| **Connection Exhaustion** | **MEDIUM** | Next.js Server Actions opening too many direct DB connections. | Use `@supabase/ssr` which operates via Supabase PostgREST REST API over HTTP, preventing DB connection pool exhaustion. |
| **Middleware Cookie Sync** | **MEDIUM** | Token expiration or cookie desync causing infinite redirect loops in App Router. | Implement canonical Supabase SSR middleware pattern returning refreshed cookies in `NextResponse.next()`. |
