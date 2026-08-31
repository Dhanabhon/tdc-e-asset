# TDC e-Asset MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างระบบบริหารจัดการครุภัณฑ์และฮาร์ดแวร์ไอที "TDC e-Asset" (MVP 1 วัน) รองรับการลงทะเบียนครุภัณฑ์, Passwordless Auth, การยืม-คืนแบบ Race-Safe ด้วย Postgres RPC, และ Dashboard สรุป 4 การ์ด พร้อมโทนสีตาม Mockup

**Architecture:** Next.js App Router (Server Actions Only) + Supabase (PostgreSQL + Auth + Storage) + Resend SMTP + Tailwind CSS + shadcn/ui. ทุกการดัดแปลงข้อมูลผ่าน Server Actions และ Postgres Stored Procedure (`FOR UPDATE` lock) ป้องกันการแย่งยืมสต็อก

**Tech Stack:** Next.js 14/15, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Zod, @supabase/ssr, Resend

---

### Task 1: Next.js Scaffolding & Design System Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/lib/utils.ts`
- Create: `src/types/database.ts`
- Create: `components.json` (shadcn config)

- [ ] **Step 1: Initialize Next.js project with Tailwind CSS & dependencies**
  - Run: `npm init -y` or setup `package.json` with Next.js, React, Lucide-react, Zod, `@supabase/ssr`, `@supabase/supabase-js`, `clsx`, `tailwind-merge`.
  - Install dependencies.

- [ ] **Step 2: Setup Theme Tokens & Tailwind Config**
  - Define warm ivory palette: Background `#F0EEE6`, Card `#FAF9F5`, Ink `#211F1C`, Terracotta `#C2593C`, Forest `#5D7D54`, Amber `#B08D3E`, Brick `#B3401F`.
  - Configure Google Fonts (`Anuphan`, `Lora`, `Sarabun`) in `src/app/layout.tsx` and `src/app/globals.css`.

- [ ] **Step 3: Setup Utility Functions & TypeScript Types**
  - In `src/lib/utils.ts`, create `cn()`, `formatThaiDate()` (พ.ศ. +543), `formatThaiCurrency()`.
  - In `src/types/database.ts`, create Database definitions for `profiles`, `categories`, `assets`, `transactions`, and status enums.

- [ ] **Step 4: Verify setup**
  - Run `npm run build` or `npx tsc --noEmit` to verify type configuration.

- [ ] **Step 5: Commit**
  - `git add . && git commit -m "chore: scaffold Next.js project with warm ivory theme tokens"`

---

### Task 2: Supabase Schema, Race-Safe RPC & ENV Setup (M4)

**Files:**
- Create: `supabase/migrations/20260831_init_schema.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `.env.example`
- Create: `.env.local`

- [ ] **Step 1: Write SQL Migration file**
  - Write complete SQL containing custom enums (`asset_status`, `transaction_type`, `return_condition`), tables (`profiles`, `categories`, `assets`, `transactions`), RLS policies, seed categories, and the two critical Postgres RPC functions:
    - `borrow_asset_rpc`: locks asset row `FOR UPDATE`, checks `available_quantity > 0`, decrements stock, updates status to `borrowed` if 0, inserts transaction.
    - `return_asset_rpc`: locks transaction `FOR UPDATE`, increments `available_quantity`, updates status to `maintenance` if damaged or `available`, marks transaction `returned`.

- [ ] **Step 2: Implement Supabase SSR Clients**
  - `src/lib/supabase/client.ts`: `createBrowserClient`
  - `src/lib/supabase/server.ts`: `createServerClient` with Next.js `cookies()`
  - `src/lib/supabase/middleware.ts`: Session refresher for Next.js Middleware

- [ ] **Step 3: Setup Environment Configuration**
  - Create `.env.example` and `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`.

- [ ] **Step 4: Verify Supabase clients**
  - Test instantiation of Supabase server client.

- [ ] **Step 5: Commit**
  - `git add supabase/ src/lib/supabase/ .env.example`
  - `git commit -m "feat(db): add supabase schema, race-safe RPCs and SSR clients"`

---

### Task 3: Passwordless Auth & Route Guard Middleware (M5)

**Files:**
- Create: `src/actions/auth.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/middleware.ts`
- Create: `src/app/page.tsx` (Public Landing)

- [ ] **Step 1: Implement Auth Server Actions**
  - `signInWithOtp(email)`: sends OTP / Magic Link via Supabase Auth (configured with Resend SMTP).
  - `verifyEmailOtp(email, token)`: verifies OTP token.
  - `signOutAction()`: clears user session and redirects to `/login`.

- [ ] **Step 2: Create Login Page (`/login`)**
  - Build minimalist passwordless login UI matching mockup `1d` (warm ivory + dark ink container, email input, OTP/Magic Link submit button with loading state).

- [ ] **Step 3: Create Auth Callback Route Handler**
  - `src/app/auth/callback/route.ts`: handles code exchange from email link and redirects to `/dashboard`.

- [ ] **Step 4: Implement Route Guard Middleware**
  - `src/middleware.ts`: redirects unauthenticated users away from `/dashboard/*`, `/assets/*`, `/borrow-return/*` to `/login`. Redirects authenticated users from `/login` to `/dashboard`.

- [ ] **Step 5: Create Public Landing Page (`/`)**
  - Build landing page matching mockup `6a`/`6c` with system introduction, features summary, and "เข้าสู่ระบบ" button.

- [ ] **Step 6: Verify Auth & Middleware**
  - Test redirection rules and login form state handling.

- [ ] **Step 7: Commit**
  - `git add src/actions/auth.ts src/app/(auth)/ src/app/auth/ src/middleware.ts src/app/page.tsx`
  - `git commit -m "feat(auth): add passwordless login, auth callback, middleware and landing page"`

---

### Task 4: Dashboard Shell Layout & Navigation (M5/M8)

**Files:**
- Create: `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `dialog.tsx`, `badge.tsx`, `table.tsx`, `skeleton.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create Core UI Components (shadcn/ui)**
  - Implement Button, Card, Input, Dialog, Badge, Table, Skeleton, DropdownMenu with warm ivory & terracotta styling.

- [ ] **Step 2: Create Admin Sidebar & Top Header**
  - Sidebar matching mockup `1a` (Logo 'e', แดชบอร์ด, ทะเบียนครุภัณฑ์, ยืม–คืน, ผู้ดูแลระบบ, ข้อมูลผู้ใช้ด้านล่าง).
  - Top header with page title, current Buddhist date, and quick action buttons ("+ เพิ่มครุภัณฑ์", "⇄ บันทึกการยืม").

- [ ] **Step 3: Assemble Dashboard Shell Layout**
  - `src/app/(dashboard)/layout.tsx`: Wraps protected pages in responsive sidebar + main content area.

- [ ] **Step 4: Commit**
  - `git add src/components/ src/app/(dashboard)/layout.tsx`
  - `git commit -m "feat(ui): add dashboard layout shell, sidebar navigation, and UI primitives"`

---

### Task 5: Asset CRUD Server Actions & Pages (M6)

**Files:**
- Create: `src/lib/validations/asset.ts`
- Create: `src/actions/assets.ts`
- Create: `src/components/assets/asset-table.tsx`
- Create: `src/components/assets/asset-form.tsx`
- Create: `src/components/assets/status-badge.tsx`
- Create: `src/app/(dashboard)/assets/page.tsx`
- Create: `src/app/(dashboard)/assets/new/page.tsx`
- Create: `src/app/(dashboard)/assets/[id]/page.tsx`
- Create: `src/app/(dashboard)/assets/[id]/edit/page.tsx`

- [ ] **Step 1: Write Zod Validation Schema**
  - `assetSchema` validating `asset_code`, `name`, `category_id`, `brand_model`, `serial_number`, `quantity`, `location`, `department`, `image_url`.

- [ ] **Step 2: Implement Asset Server Actions**
  - `getAssets({ search, category_id, status, page, limit })`
  - `getAssetById(id)` (with category relation & transaction history)
  - `createAsset(formData)` (calls `revalidatePath('/assets')` and `revalidatePath('/dashboard')`)
  - `updateAsset(id, formData)`
  - `deleteAsset(id)`

- [ ] **Step 3: Create Asset Directory Page (`/assets`)**
  - Search bar, Category dropdown, Status dropdown, Asset Table with status pill badges (พร้อมใช้งาน, กำลังถูกยืม, ส่งซ่อม) and pagination controls matching mockup `2a`.

- [ ] **Step 4: Create Add & Edit Asset Forms (`/assets/new`, `/assets/[id]/edit`)**
  - 2-Column form matching mockup `1b` (Section 1: General info, Section 2: Procurement/Location, Right summary card).

- [ ] **Step 5: Create Asset Detail Page (`/assets/[id]`)**
  - Detail view matching mockup `2b` (Photo placeholder/URL, Specs, Owner/Location, Borrow-return history timeline).

- [ ] **Step 6: Commit**
  - `git add src/lib/validations/asset.ts src/actions/assets.ts src/components/assets/ src/app/(dashboard)/assets/`
  - `git commit -m "feat(assets): implement asset CRUD with server actions, search, filter and detail view"`

---

### Task 6: Borrow-Return with Race-Safe RPC (M7)

**Files:**
- Create: `src/lib/validations/transaction.ts`
- Create: `src/actions/transactions.ts`
- Create: `src/components/borrow-return/borrow-form.tsx`
- Create: `src/components/borrow-return/active-loans-table.tsx`
- Create: `src/components/borrow-return/return-dialog.tsx`
- Create: `src/app/(dashboard)/borrow-return/page.tsx`

- [ ] **Step 1: Write Transaction Validation Schemas**
  - `borrowSchema` (asset_id, borrower_name, borrower_department, due_date, notes)
  - `returnSchema` (transaction_id, condition, notes)

- [ ] **Step 2: Implement Transaction Server Actions**
  - `borrowAssetAction(data)`: calls `supabase.rpc('borrow_asset_rpc', ...)` and handles error message or success. Revalidates paths.
  - `returnAssetAction(data)`: calls `supabase.rpc('return_asset_rpc', ...)`. Revalidates paths.
  - `getActiveLoans()`: fetches currently borrowed assets with overdue calculation.

- [ ] **Step 3: Create Borrow & Return Page (`/borrow-return`)**
  - Left column: Walk-in borrow form with asset selector, borrower name/department, due date calendar, submit button matching mockup `2c`.
  - Right column: Active loans list with tabs (กำลังยืม, เกินกำหนด, คืนแล้ว) and "รับคืน" action button.

- [ ] **Step 4: Create Return Modal (`return-dialog.tsx`)**
  - Modal matching mockup `3a` with item info, condition radio selection (✓ ปกติ / ชำรุดเล็กน้อย / ชำรุด ส่งซ่อม), notes input, and "ยืนยันรับคืน" button.

- [ ] **Step 5: Commit**
  - `git add src/lib/validations/transaction.ts src/actions/transactions.ts src/components/borrow-return/ src/app/(dashboard)/borrow-return/`
  - `git commit -m "feat(transactions): implement race-safe borrow-return with RPC and return modal"`

---

### Task 7: Dashboard 4 Cards & Recent Transactions (M8)

**Files:**
- Create: `src/actions/dashboard.ts`
- Create: `src/components/dashboard/stat-cards.tsx`
- Create: `src/components/dashboard/overdue-banner.tsx`
- Create: `src/components/dashboard/recent-transactions-table.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Implement Dashboard Server Actions**
  - `getDashboardStats()`: returns count of total assets, available assets, borrowed assets, maintenance assets, overdue count, and the 10 most recent transactions.

- [ ] **Step 2: Build 4 KPI Summary Cards**
  - 4 Cards matching mockup `1a` (ทั้งหมด, กำลังถูกยืม, เกินกำหนดคืน, ส่งซ่อม/ชำรุด) with big Lora serif numbers.

- [ ] **Step 3: Build Overdue Alert Banner**
  - Banner displaying count of overdue items with alert styling (`#F7E5DF` background, `#B3401F` text) and "ดูทั้งหมด →" quick link.

- [ ] **Step 4: Build Recent 10 Transactions Table**
  - Table displaying the last 10 borrow/return records with borrower name, date, due date, status pill badge, and Quick Return trigger button.

- [ ] **Step 5: Assemble Dashboard Page (`/dashboard`)**
  - Integrates StatCards, OverdueBanner, RecentTransactionsTable into a clean, reactive layout.

- [ ] **Step 6: Commit**
  - `git add src/actions/dashboard.ts src/components/dashboard/ src/app/(dashboard)/dashboard/`
  - `git commit -m "feat(dashboard): implement 4 summary cards, overdue banner, and recent 10 transactions"`

---

### Task 8: End-to-End Build Test & Verification

**Files:**
- Modify: `README.md`
- Create: `docs/deployment.md`

- [ ] **Step 1: Type Checking & Production Build**
  - Run: `npm run build`
  - Verify zero TypeScript or Next.js compilation errors.

- [ ] **Step 2: End-to-End Flow Verification**
  - Verify Auth & Middleware protection.
  - Verify Asset CRUD flow (Create -> List -> Detail -> Edit).
  - Verify Borrow -> Stock decrements -> Status changes to borrowed.
  - Verify Return -> Stock increments -> Status updates.
  - Verify Dashboard 4 cards & recent 10 transactions sync accurately.

- [ ] **Step 3: Document Vercel Deployment & Supabase Setup Guide**
  - Write detailed instructions in `README.md` and `docs/deployment.md`.

- [ ] **Step 4: Commit**
  - `git add README.md docs/deployment.md`
  - `git commit -m "docs: add project README and deployment verification guide"`
