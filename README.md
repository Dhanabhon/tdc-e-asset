# TDC e-Asset - ระบบบริหารจัดการครุภัณฑ์หน่วยงานราชการ (MVP)

> **TDC e-Asset** แพลตฟอร์มบริหารจัดการครุภัณฑ์และสินทรัพย์ไอทีสำหรับหน่วยงานราชการ บันทึกทะเบียนพัสดุ ติดตามการยืม–คืนออนไลน์ ป้องกันสต็อกติดลบด้วย Concurrency Row-Level Lock และรายงานสรุปข้อมูลแบบเรียลไทม์

> [!NOTE]
> 🎓 **Demo Project:** โครงการนี้เป็นโปรเจกต์สาธิต (Demo Project) สำหรับหลักสูตรและเวิร์กช็อป **[AI-Ready Developers Workshop](https://github.com/Dhanabhon/ai-ready-developers-workshop)** เพื่อสาธิตการออกแบบ พัฒนา และส่งมอบระบบจริงร่วมกับ AI โดยใช้สถาปัตยกรรมระดับองค์กร (Next.js 16 App Router + Supabase PostgreSQL + Resend + Vercel)

---

## 🚀 จุดเด่นและคุณสมบัติหลัก (Key Features)

1. **ทะเบียนครุภัณฑ์และสินทรัพย์ไอที (Asset Registry & Inventory)**
   - บันทึกรหัสครุภัณฑ์ (Asset Code), หมายเลขเครื่อง (Serial Number), ยี่ห้อ/รุ่น, หมวดหมู่, สถานที่จัดเก็บ และรูปภาพ
   - จัดหมวดหมู่ 5 หมวดหลักตามมาตรฐานราชการ (คอมพิวเตอร์, สำนักงาน, ไฟฟ้าและวิทยุ, โฆษณาและเผยแพร่, งานบ้านงานครัว)
   - ค้นหาและกรองข้อมูลตามหมวดหมู่ สถานะ (พร้อมใช้, ถูกยืม, ซ่อมบำรุง) และคำค้นหา

2. **ระบบยืม–คืนออนไลน์แบบ Race-Safe (Borrow & Return Management)**
   - บันทึกการยืม walk-in พร้อมระบุผู้ยืม สังกัดหน่วยงาน และกำหนดวันส่งคืน
   - คำนวณสถานะเกินกำหนด (Overdue) และจำนวนวันค้างคืนอัตโนมัติ
   - บันทึกการรับคืนพร้อมประเมินสภาพ (ปกติ, ชำรุดเล็กน้อย, ชำรุดส่งซ่อม) โดยระบบจะปรับสถานะครุภัณฑ์เป็น "ส่งซ่อม" อัตโนมัติหากอุปกรณ์เสียหาย
   - ป้องกันปัญหาแย่งยืมพร้อมกัน (Race Condition) ด้วย **PostgreSQL Stored Procedure (RPC) พร้อม `FOR UPDATE` Row Lock**

3. **แดชบอร์ดสรุปผลและรายงานผู้บริหาร (Executive Dashboard & Reports)**
   - 4 มิติ KPI Card: ครุภัณฑ์ทั้งหมด, พร้อมใช้งาน, อยู่ระหว่างถูกยืม, ส่งซ่อมบำรุง
   - แถบเตือนภัยครุภัณฑ์เกินกำหนดคืน (Overdue Banner) แบบไดนามิก
   - ตารางแสดง 10 ธุรกรรมล่าสุด พร้อมปุ่มรับคืนด่วน (Quick Return Modal)
   - หน้ารายงานสรุปมูลค่าทางบัญชีและจำแนกตามหมวดหมู่

4. **ความปลอดภัยระดับมาตรฐานองค์กร (Enterprise Security)**
   - เข้าสู่ระบบแบบไร้รหัสผ่าน (**Passwordless Magic Link & Email OTP**)
   - นโยบายความปลอดภัยระดับตาราง (**PostgreSQL Row Level Security - RLS**)
   - ป้องกันเส้นทาง Dashboard ด้วย **Next.js Edge Middleware**

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ | เทคโนโลยี | รายละเอียด |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | Server Components, Client Components, Turbopack, Dynamic Routes |
| **Language** | **TypeScript 5** | Strict Type Safety ตลอดทั้งระบบ |
| **Styling & UI** | **Tailwind CSS v4 + shadcn/ui** | Base UI Primitives, Lucide Icons, Warm Editorial Palette |
| **Backend & Data Layer** | **Next.js Server Actions** | Type-safe Server Mutations, Cache Revalidation (`revalidatePath`) |
| **Database & Auth** | **Supabase (PostgreSQL 15+)** | Auth (GoTrue), Row Level Security (RLS), Stored Procedures (PL/pgSQL RPC) |
| **Transactional Email** | **Resend SMTP** | จัดส่ง Magic Link และ OTP ผ่าน Custom SMTP ใน Supabase |
| **Deployment** | **Vercel** | Edge Network, Zero-Config Next.js CI/CD Hosting |

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture Summary)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                   │
│                                                         │
│  ┌─────────────────┐             ┌───────────────────┐  │
│  │   Edge Guard    │             │  Server Actions   │  │
│  │ (middleware.ts) │             │ (actions/*.ts)    │  │
│  └────────┬────────┘             └─────────┬─────────┘  │
└───────────┼────────────────────────────────┼────────────┘
            │ Token Sync                     │ Data Mutate / RPC
            ▼                                ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase Platform                    │
│                                                         │
│  ┌─────────────────┐             ┌───────────────────┐  │
│  │  Supabase Auth  │             │   PostgreSQL DB   │  │
│  │ (Magic Link/OTP)│             │ (RLS + Triggers)  │  │
│  └────────┬────────┘             └─────────▲─────────┘  │
│           │                                │            │
│           ▼ Custom SMTP                    │ FOR UPDATE │
│  ┌─────────────────┐             ┌─────────┴─────────┐  │
│  │   Resend API    │             │ borrow_asset_rpc  │  │
│  │ (smtp.resend)   │             │ return_asset_rpc  │  │
│  └─────────────────┘             └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Server Actions Data Layer**: ไม่มีการส่ง API Key ของ Database ไปยัง Client; ข้อมูลถูกประมวลผลบนเซิร์ฟเวอร์แบบ Type-safe พร้อมเรียก `revalidatePath()` เพื่ออัปเดตหน้าจอทันที
- **Race-Safe Postgres RPC**: ฟังก์ชัน `borrow_asset_rpc` และ `return_asset_rpc` ทำงานแบบ Transaction ภายใต้ `FOR UPDATE` lock ป้องกันการยืมซ้อนและการลดสต็อกติดลบ
- **Passwordless Authentication**: ใช้ Supabase Auth ร่วมกับ Resend Custom SMTP เพื่อส่ง magic link / OTP 6 หลักเข้าอีเมลเจ้าหน้าที่
- **Edge Middleware Protection**: ตรวจสอบ Session token ใน cookies ทุก request สู่เส้นทาง `/(dashboard)/*` หากไม่มีสิทธิ์จะ redirect ไปยัง `/login` อัตโนมัติ

---

## 📦 โครงสร้างโปรเจกต์ (Project Structure)

```
tdc-e-asset/
├── actions/                  # Next.js Server Actions (Auth, Assets, Categories, Transactions)
├── app/
│   ├── (auth)/               # กลุ่มหน้า Authentication (/login, /auth/callback)
│   ├── (dashboard)/          # หน้าภายในระบบสำหรับเจ้าหน้าที่
│   │   ├── dashboard/        # ภาพรวมสถิติและตารางธุรกรรมล่าสุด
│   │   ├── assets/           # รายการ, เพิ่ม, รายละเอียด, และแก้ไขครุภัณฑ์
│   │   ├── borrow-return/    # บันทึกการยืม walk-in และรับคืนครุภัณฑ์
│   │   ├── categories/       # จัดการหมวดหมู่ครุภัณฑ์
│   │   ├── reports/          # รายงานสรุปตามหมวดหมู่และปีงบประมาณ
│   │   └── admin/            # รายชื่อผู้ดูแลระบบและสถานะความปลอดภัย
│   ├── globals.css           # Global Styles และชุดสี Tailwind
│   ├── layout.tsx            # Root Layout
│   └── page.tsx              # Public Landing Page นำเสนอระบบ
├── components/
│   ├── assets/               # คอมโพเนนต์หน้าครุภัณฑ์ (Form, Table, Badges)
│   ├── borrow-return/        # คอมโพเนนต์การยืม-คืน (BorrowReturnClient, ReturnDialog)
│   ├── dashboard/            # คอมโพเนนต์หน้าสรุป (StatCards, RecentTransactionsTable, OverdueBanner)
│   ├── layout/               # App Header, Sidebar, User Navigation
│   └── ui/                   # shadcn/ui Primitives (Button, Dialog, Card, Input, Select, etc.)
├── docs/
│   ├── architecture_spec.md  # เอกสารสถาปัตยกรรมและรายละเอียดทางเทคนิค
│   └── deployment.md         # คู่มือและ Checklist การ Deploy ขึ้น Vercel + Postgres Verification
├── lib/
│   ├── supabase/             # Supabase Client & Server SSR Helpers (@supabase/ssr)
│   ├── types/                # Database Types จาก Supabase Schema
│   ├── validations/          # Zod Schemas สำหรับตรวจสอบข้อมูลฟอร์ม
│   └── utils.ts              # ฟังก์ชันจัดรูปแบบวันที่ภาษาไทยและ Tailwind helper
├── supabase/
│   └── migrations/           # SQL Migration Files (ตาราง, RLS, Triggers, RPC, Sample Data)
└── middleware.ts             # Global Route Protection Guard
```

---

## ⚡ เริ่มต้นใช้งานอย่างรวดเร็ว (Quick Start Guide)

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies

```bash
git clone https://github.com/Dhanabhon/tdc-e-asset.git
cd tdc-e-asset
npm install
```

### 2. ตั้งค่าฐานข้อมูล Supabase

1. เข้าสู่ระบบ [Supabase Dashboard](https://supabase.com/dashboard) และสร้าง New Project
2. ไปที่เมนู **SQL Editor** ในแดชบอร์ด Supabase
3. เปิดไฟล์ `supabase/migrations/20260831_init_schema.sql` คัดลอกโค้ดทั้งหมด วางลงใน SQL Editor แล้วกด **Run**
   - คำสั่งนี้จะสร้างตาราง `profiles`, `categories`, `assets`, `transactions`, ฟังก์ชัน `borrow_asset_rpc`, `return_asset_rpc`, นโยบาย RLS, และข้อมูลตัวอย่างสำหรับทดสอบ

### 3. ตั้งค่าระบบส่งอีเมล Resend (Custom SMTP)

เพื่อให้ระบบสามารถส่ง Magic Link และ Email OTP ได้โดยไม่ติดข้อจำกัดอัตราส่ง (Rate Limit):
1. สมัครบัญชีที่ [Resend](https://resend.com) และสร้าง API Key (Full Access)
2. ใน Supabase Dashboard ไปที่ **Project Settings** → **Authentication** → **SMTP Settings**
3. เปิดใช้งาน **Enable Custom SMTP** และกรอกข้อมูล:
   - **Sender email**: อีเมลผู้ส่ง (เช่น `noreply@yourdomain.com` หรือ `onboarding@resend.dev` สำหรับ sandbox)
   - **Sender name**: `TDC e-Asset System`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) หรือ `587` (TLS)
   - **Username**: `resend`
   - **Password**: `<RESEND_API_KEY ของคุณ>`
4. ไปที่ **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (หรือ URL ของ Vercel)
   - **Redirect URLs**: เพิ่ม `http://localhost:3000/auth/callback` และ `https://<your-project>.vercel.app/auth/callback`

### 4. กำหนดค่าตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:

```bash
cp .env.example .env.local
```

กรอกข้อมูลในไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **หมายเหตุ**: สามารถค้นหา `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ได้จาก **Project Settings** → **API** ใน Supabase Dashboard

### 5. รันโปรเจกต์ในเครื่อง (Local Development)

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000) เพื่อเข้าชมหน้า Landing Page และเข้าสู่ระบบ

---

## 🧪 การตรวจสอบคุณภาพโค้ด (Testing & Quality Gates)

```bash
# ตรวจสอบ TypeScript Type Safety
npx tsc --noEmit

# ตรวจสอบ ESLint Rules (0 errors, 0 warnings)
npm run lint

# ทดสอบ Production Build
npm run build
```

---

## 🌐 การ Deploy สู่ Vercel (Production Deployment)

ดูคู่มือการตั้งค่าอย่างละเอียดได้ที่ [`docs/deployment.md`](./docs/deployment.md)

1. Push โค้ดขึ้น GitHub Repository
2. นำเข้า Repository เข้าสู่ [Vercel](https://vercel.com)
3. กำหนดค่า Environment Variables ใน Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` (URL โดเมนของ Vercel)
4. อัปเดต **Site URL** และ **Redirect URLs** ใน Supabase ให้ตรงกับโดเมนบน Vercel
5. กด **Deploy**

---

## 🎓 โครงการสาธิต (Demo Project Context)

โปรเจกต์นี้ถูกพัฒนาขึ้นเพื่อเป็นตัวอย่างเชิงปฏิบัติ (Case Study & Demo Project) ของหลักสูตร:
👉 **[AI-Ready Developers Workshop](https://github.com/Dhanabhon/ai-ready-developers-workshop)**

มุ่งเน้นการถ่ายทอดเทคนิคการทำงานร่วมกับ AI Coding Assistant (เช่น Spec-Driven Development, Concurrency Row-Level Locking, Enterprise Auth & Middleware, Automated Quality Gates และ Production Deployment)

---

## 📄 ใบอนุญาต (License)

พัฒนาขึ้นเพื่อการใช้งานภายในหน่วยงานราชการและประกอบการศึกษา · จัดทำตามมาตรฐานซอฟต์แวร์ภาครัฐ
