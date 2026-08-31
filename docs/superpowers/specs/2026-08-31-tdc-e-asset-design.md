# TDC e-Asset — System Design & Architecture Specification (MVP)

**Document Version:** 1.0.0  
**Date:** 2026-08-31  
**Author:** Senior Full-Stack Architect  
**Status:** Approved by User  

---

## 1. Overview & Business Context

**TDC e-Asset** คือระบบบริหารจัดการครุภัณฑ์และฮาร์ดแวร์ไอทีแบบรวมศูนย์สำหรับหน่วยงานราชการ (คอมพิวเตอร์ตั้งโต๊ะ, โน้ตบุ๊ก, จอภาพ, อุปกรณ์ต่อพ่วง, เซิร์ฟเวอร์/เครือข่าย) รองรับการบันทึกข้อมูลครุภัณฑ์ การยืม-คืนแบบ Walk-in ติดตามสถานะเกินกำหนดส่งคืน และแดชบอร์ดสรุปภาพรวม

### 1.1 Constraints & Technical Stack
- **Target Platform:** Web Application (Next.js 14/15 App Router + TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Design Reference:** Warm Ivory Theme (`#F0EEE6` background, `#FAF9F5` card surface, `#211F1C` ink text, `#C2593C` terracotta primary, Thai fonts: Anuphan, Lora, Sarabun)
- **Data Layer:** Next.js Server Actions only (ห้ามสร้าง API Route สำหรับ CRUD ยกเว้น `/auth/callback` สำหรับแลกเปลี่ยน session code)
- **Database & Auth:** Supabase PostgreSQL + Supabase Auth (Passwordless Email OTP / Magic Link)
- **Email Delivery:** Resend (ผ่าน Supabase Custom SMTP หรือ Resend API สำหรับส่งอีเมลแจ้งเตือน/OTP)
- **Infrastructure:** Vercel Hobby Free Tier + Supabase Free Tier
- **Timeline:** 1-Day MVP Delivery

---

## 2. Database Schema Design (PostgreSQL on Supabase)

### 2.1 Enums & Types
```sql
CREATE TYPE asset_status AS ENUM ('available', 'borrowed', 'maintenance');
CREATE TYPE transaction_type AS ENUM ('borrow', 'return');
CREATE TYPE return_condition AS ENUM ('good', 'damaged_minor', 'damaged_repair');
```

### 2.2 Table Definitions

```sql
-- 1. Profiles Table (Linked with Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    department TEXT DEFAULT 'กองบริหารพัสดุ',
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    prefix_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Assets Table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand_model TEXT,
    serial_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    available_quantity INTEGER NOT NULL DEFAULT 1 CHECK (available_quantity >= 0 AND available_quantity <= quantity),
    status asset_status NOT NULL DEFAULT 'available',
    image_url TEXT,
    location TEXT,
    department TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Transactions Table (Borrow / Return Log)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    borrower_name TEXT NOT NULL,
    borrower_department TEXT NOT NULL,
    type transaction_type NOT NULL DEFAULT 'borrow',
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    due_date TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' (borrowing), 'returned', 'overdue'
    notes TEXT,
    condition_on_return return_condition,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for high-frequency queries
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_asset_code ON assets(asset_code);
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
```

### 2.3 Row Level Security (RLS) Policies
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories: Read-only for authenticated, write for authenticated admin
CREATE POLICY "Authenticated users can read categories" ON categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert/update categories" ON categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Assets: Authenticated users have full CRUD
CREATE POLICY "Authenticated users can manage assets" ON assets
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Transactions: Authenticated users have full CRUD
CREATE POLICY "Authenticated users can manage transactions" ON transactions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### 2.4 Race-Safe Postgres RPC Functions (Row-Level Locking)

```sql
-- Borrow Asset RPC with Concurrency Lock
CREATE OR REPLACE FUNCTION borrow_asset_rpc(
    p_asset_id UUID,
    p_borrower_name TEXT,
    p_borrower_dept TEXT,
    p_due_date TIMESTAMPTZ,
    p_notes TEXT,
    p_user_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_available INT;
    v_status asset_status;
    v_tx_id UUID;
BEGIN
    -- ล็อกแถวของครุภัณฑ์ทันทีเพื่อกัน race condition
    SELECT available_quantity, status INTO v_available, v_status
    FROM assets WHERE id = p_asset_id FOR UPDATE;

    IF v_available IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'ไม่พบครุภัณฑ์นี้ในระบบ');
    END IF;

    IF v_status = 'maintenance' THEN
        RETURN jsonb_build_object('success', false, 'error', 'ครุภัณฑ์นี้อยู่ระหว่างซ่อมบำรุง ไม่สามารถยืมได้');
    END IF;

    IF v_available <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'ครุภัณฑ์นี้ถูกยืมหมดแล้ว');
    END IF;

    -- ลดจำนวนสต็อกพร้อมใช้
    UPDATE assets
    SET available_quantity = available_quantity - 1,
        status = CASE WHEN available_quantity - 1 = 0 THEN 'borrowed'::asset_status ELSE status END,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_asset_id;

    -- สร้างประวัติการยืม
    INSERT INTO transactions (
        asset_id, borrower_name, borrower_department, type, due_date, status, notes, created_by
    ) VALUES (
        p_asset_id, p_borrower_name, p_borrower_dept, 'borrow', p_due_date, 'active', p_notes, p_user_id
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id);
END;
$$;

-- Return Asset RPC with Concurrency Lock & Condition Assessment
CREATE OR REPLACE FUNCTION return_asset_rpc(
    p_transaction_id UUID,
    p_condition return_condition,
    p_notes TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_asset_id UUID;
BEGIN
    -- ล็อกรายการยืม
    SELECT asset_id INTO v_asset_id
    FROM transactions
    WHERE id = p_transaction_id AND returned_at IS NULL
    FOR UPDATE;

    IF v_asset_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'ไม่พบรายการยืมที่ยังค้างอยู่');
    END IF;

    -- ล็อกและคืนสต็อกครุภัณฑ์
    UPDATE assets
    SET available_quantity = available_quantity + 1,
        status = CASE 
            WHEN p_condition = 'damaged_repair' THEN 'maintenance'::asset_status 
            ELSE 'available'::asset_status 
        END,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_asset_id;

    -- ปิดรายการยืม
    UPDATE transactions
    SET returned_at = timezone('utc'::text, now()),
        status = 'returned',
        condition_on_return = p_condition,
        notes = CASE 
            WHEN p_notes IS NOT NULL AND p_notes != '' THEN COALESCE(notes || ' | ' || p_notes, p_notes)
            ELSE notes 
        END
    WHERE id = p_transaction_id;

    RETURN jsonb_build_object('success', true);
END;
$$;
```

---

## 3. Directory & Code Architecture

```
src/
├── actions/                         # ⚡ Data Layer: Server Actions Only
│   ├── auth.ts                     # signInWithEmailOtp, verifyOtp, signOutAction
│   ├── assets.ts                   # getAssets, getAssetById, createAsset, updateAsset, deleteAsset
│   ├── categories.ts               # getCategories
│   ├── transactions.ts             # borrowAssetAction (calls RPC), returnAssetAction (calls RPC), getRecentTransactions
│   └── dashboard.ts                # getDashboardStats (4 cards + recent 10 transactions)
│
├── app/
│   ├── (auth)/                     # Auth Route Group
│   │   ├── login/
│   │   │   └── page.tsx            # Minimalist Passwordless Login
│   │   └── auth/callback/
│   │       └── route.ts            # OAuth/Magic Link Token Exchange Route Handler
│   │
│   ├── (dashboard)/                # Protected Admin Shell
│   │   ├── layout.tsx              # Sidebar, Top Header, User Nav, Breadcrumbs
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard: 4 Cards + 10 Recent Transactions
│   │   ├── assets/
│   │   │   ├── page.tsx            # Asset Directory Table, Search & Filter
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # 2-Column Asset Creation Form
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Asset Detail & Transaction History
│   │   │       └── edit/
│   │   │           └── page.tsx    # Asset Edit Form
│   │   └── borrow-return/
│   │       └── page.tsx            # Walk-in Borrow Form + Active Loans List + Return Dialog
│   │
│   ├── layout.tsx                  # Root Layout: Fonts, Theme, Toaster
│   ├── page.tsx                    # Public Landing Page (ตาม Mockup 6a/6c)
│   └── globals.css                 # Custom Design Tokens & Tailwind Base
│
├── components/
│   ├── ui/                         # shadcn/ui Primitives (Button, Dialog, Badge, Input, Table, Skeleton)
│   ├── layout/                     # Sidebar, Header, Breadcrumbs, AdminProfileMenu
│   ├── dashboard/                  # StatCard, RecentLoansTable, OverdueBanner
│   ├── assets/                     # AssetTable, AssetFilters, AssetForm, StatusBadge
│   └── borrow-return/              # BorrowForm, ActiveLoanTable, ReturnDialog
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Client (createBrowserClient)
│   │   ├── server.ts               # Server Client for Server Actions & Server Components
│   │   └── middleware.ts           # Middleware session synchronizer
│   ├── resend/
│   │   └── client.ts               # Resend Client & Email templates
│   ├── utils.ts                    # cn(), formatThaiDate() (+543 พ.ศ.), formatCurrency()
│   ├── validations/                # Zod schemas (assetSchema, borrowSchema, returnSchema)
│   └── types/                      # Database & App TypeScript definitions
│
└── middleware.ts                   # Edge Route Guard: Protects /(dashboard)/* routes
```

---

## 4. Email Integration: Resend

สำหรับแก้ปัญหา Supabase Free Tier Email Rate Limits:
1. **Supabase Custom SMTP with Resend:**
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) หรือ `587` (TLS)
   - Username: `resend`
   - Password: `<RESEND_API_KEY>`
   - Sender Name: `TDC e-Asset`
   - Sender Email: `noreply@<yourdomain.com>` หรือ `onboarding@resend.dev` (ใน Sandbox/Dev mode)
2. **Direct Transactional Email (Optional Alert Hook):**
   - ใช้งานผ่าน `@react-email/components` + `resend` SDK ใน `src/lib/resend/client.ts` เมื่อต้องการส่งการแจ้งเตือนการยืม-คืนสำเร็จ หรือแจ้งเตือนเกินกำหนดคืน

---

## 5. Milestone Breakdown (M4 – M8)

| Milestone | Scope | Deliverables |
|---|---|---|
| **M4: DB & Environment** | Schema, RPC, ENV, Seed Data | Table definitions, RLS policies, Postgres RPCs, Seed 5 categories + mock assets, `.env.local` |
| **M5: Auth & Middleware** | Passwordless Auth + Route Guard | `/login`, `/auth/callback`, `src/actions/auth.ts`, `middleware.ts` protecting admin routes, Resend SMTP config |
| **M6: Asset CRUD** | Asset Management | `/assets` List with search & filters, `/assets/new` creation form, `/assets/[id]` detail page, Server Actions |
| **M7: Borrow-Return** | Race-Safe Transactions | `/borrow-return` page, Walk-in borrow form calling `borrow_asset_rpc`, Return Modal calling `return_asset_rpc`, Overdue highlight |
| **M8: Dashboard & Polish** | 4-Card Dashboard & UI Polish | `/dashboard` with 4 KPI cards + recent 10 transactions table, Responsive design, Warm ivory theme polish, Vercel Deploy |

---

## 6. Risk Assessment & Mitigations

1. **Email Deliverability & Rate Limits:**
   - *Risk:* Supabase default SMTP limits ~3-4 emails/hr.
   - *Mitigation:* ใช้ Resend Custom SMTP ทำให้ส่ง OTP ได้ไม่จำกัดตามโควตา Resend Free (3,000 emails/month).
2. **Double-Borrowing Race Condition:**
   - *Risk:* ผู้ใช้ 2 คนกดยืมอุปกรณ์ชิ้นสุดท้ายพร้อมกัน
   - *Mitigation:* จัดการผ่าน Postgres `FOR UPDATE` Row-Level Lock ภายใน Stored Procedure `borrow_asset_rpc`.
3. **Next.js Server Component Cache Invalidation:**
   - *Risk:* หน้า Dashboard แสดงข้อมูลไม่อัปเดตหลังยืม/คืน
   - *Mitigation:* เพิ่ม `revalidatePath('/dashboard')`, `revalidatePath('/assets')`, `revalidatePath('/borrow-return')` ใน Server Actions ทั้งหมด.
4. **Thai Buddhist Era (พ.ศ.) Conversion:**
   - *Risk:* Timezone คลาดเคลื่อนเมื่อบันทึกเวลา
   - *Mitigation:* บันทึก UTC `TIMESTAMPTZ` ใน DB เสมอ แล้วแปลงแสดงผลเป็น พ.ศ. (+543) ที่ Helper Layer เท่านั้น.
