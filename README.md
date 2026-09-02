# TDC e-Asset - ระบบบริหารจัดการครุภัณฑ์หน่วยงานราชการ (MVP)

[![Build Status](https://github.com/Dhanabhon/tdc-e-asset/actions/workflows/deploy.yml/badge.svg)](https://github.com/Dhanabhon/tdc-e-asset/actions/workflows/deploy.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com)

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

### 2. ตั้งค่าฐานข้อมูล Supabase (Database Setup & Migration)

คุณสามารถเลือกวิธีรัน Migration ได้ 2 รูปแบบตามสะดวก:

#### วิธีที่ 1: รันคำสั่งอัตโนมัติผ่าน Terminal (แนะนำและสะดวกที่สุด)
1. นำ Connection String จาก Supabase Dashboard (**Project Settings** → **Database** → **Connection string URI**) มาใส่ใน `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```
2. รันคำสั่ง Migration:
   ```bash
   npm run db:migrate
   ```
   *ระบบจะเชื่อมต่อไปยัง Supabase และรันไฟล์ SQL ใน `supabase/migrations/` ให้ครบถ้วนโดยอัตโนมัติ พร้อมบันทึกสถานะลงตาราง `_schema_migrations`*

#### วิธีที่ 2: รันผ่าน Supabase SQL Editor ในเว็บเบราว์เซอร์
1. ไปที่เมนู **SQL Editor** ในแดชบอร์ด Supabase
2. เปิดไฟล์ `supabase/migrations/20260831_init_schema.sql` คัดลอกโค้ดทั้งหมด วางลงใน SQL Editor แล้วกด **Run**
3. รันไฟล์ `supabase/migrations/20260902_create_storage_bucket.sql` เพื่อสร้าง Storage Bucket สำหรับเก็บรูปภาพครุภัณฑ์

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

## 📊 สถิติการพัฒนาด้วย AI และการบริหารโควตา (AI Metrics & Quota Analysis)

โครงการนี้ถูกพัฒนาขึ้นด้วยกระบวนการ **Autonomous Agentic Coding** ร่วมกับระบบ **Google Antigravity (AGY)** โดยมีสถิติการใช้งานจริงและข้อพิจารณาเรื่องโควตาการใช้งานดังนี้:

### 1. สถิติการใช้ Tokens ในโครงการนี้ (Actual Project Metrics)

* **โมเดล AI หลักและ Subagents**: **Google Gemini 2.5 Pro** (พร้อมเปิดระบบ Thinking / Chain-of-Thought เพื่อวางแผนและตรวจสอบโค้ดเชิงลึก)
* **สถาปัตยกรรม Agentic**: **1 Main Orchestrator** ร่วมกับ **12 Specialized Subagents** (วิศวกรเฉพาะทางและผู้ตรวจสอบ Spec Compliance)
* **จำนวนรอบการคิดและการทำงาน (Total Steps / API Turns)**: **1,997 Steps**
* **Output Tokens ที่ AI สร้างขึ้นจริง**: **~1,228,765 Tokens** (ประมาณ 1.23 ล้าน Tokens / ~4.42 ล้านตัวอักษร)
* **Cumulative Context Tokens**: **~280M – 330M Tokens** (คำนวณจากประวัติการสนทนา, โค้ดที่อ่านวิเคราะห์, และผลการรันคำสั่ง Terminal สะสมตลอด ~2,000 รอบ)

#### การแบ่งสัดส่วนการทำงานระหว่าง Main Agent และ Subagents

| บทบาท (Agent Role) | จำนวน Steps ที่ทำงาน | Output Tokens ที่สร้าง |
| :--- | :---: | :---: |
| 👑 **Main Agent (Orchestrator & Coordinator)** | 1,038 | ~579,035 |
| 🛠️ Subagent 1: **Database & Infrastructure Engineer** | 106 | ~51,129 |
| 🛡️ Subagent 2: **Spec Compliance Reviewer (DB)** | 28 | ~13,942 |
| 🛠️ Subagent 3: **Auth & Middleware Engineer** | 119 | ~68,216 |
| 🛡️ Subagent 4: **Spec Compliance Reviewer (Auth)** | 33 | ~21,622 |
| 🛠️ Subagent 5: **Asset Feature Engineer** | 140 | ~94,866 |
| 🛡️ Subagent 6: **Spec Compliance Reviewer (Asset)** | 33 | ~31,666 |
| 🛠️ Subagent 7: **Borrow-Return Feature Engineer** | 106 | ~61,678 |
| 🛡️ Subagent 8: **Spec Compliance Reviewer (Borrow-Return)** | 37 | ~27,649 |
| 🛠️ Subagent 9: **Dashboard Feature Engineer** | 90 | ~65,185 |
| 🛡️ Subagent 10: **Spec Compliance Reviewer (Dashboard)** | 37 | ~25,331 |
| 🛠️ Subagent 11: **Documentation & Verification Engineer** | 107 | ~78,122 |
| 🛡️ Subagent 12: **Final Code Reviewer** | 123 | ~110,317 |
| **รวมทั้งสิ้น (Total)** | **1,997 Steps** | **~1,228,765 Tokens** |

---

### 2. การประเมินการใช้งานบน Google Antigravity: Pro vs. Free Tier

ระบบ Antigravity คำนวณโควตาจาก **"Compute Effort"** (ภาระงานที่ Agent กระทำ เช่น การค้นหาไฟล์ทั้งระบบ, การสร้างไฟล์ใหม่, การคอมไพล์โค้ด, และการ Spawn Subagents) ซึ่งกินทรัพยากรมากกว่าการถาม-ตอบทั่วไปหลายเท่าตัว

| มิติการเปรียบเทียบ | Google AI Pro / Ultra Tier | Antigravity Free Tier (Individual) |
| :--- | :--- | :--- |
| **กลไกการรีเฟรชโควตา (Refresh Cycle)** | **ทุกๆ 5 ชั่วโมง** (Rolling 5-Hour Window) | **รายสัปดาห์ (Weekly Rate Limit Bucket)** |
| **ขีดความสามารถต่อรอบ** | สูงมาก รองรับการทำงานต่อเนื่องได้ทั้งวัน | ~50 – 100 Steps / สัปดาห์ (~50k–80k tokens) |
| **จำนวนรอบ Reset เพื่อจบโปรเจกต์นี้** | **2 – 3 รอบ** | **ประมาณ 15 – 20 รอบสัปดาห์** |
| **ระยะเวลาจริงที่ต้องใช้** | **1 – 2 วัน** | **ประมาณ 3 – 5 เดือน** (หากรอ Weekly Reset) |
| **การรองรับ Multi-Subagent** | รองรับการรัน Subagent ขนานกันได้เต็มรูปแบบ | เสี่ยงติดโควตาหมดทันทีภายในไม่กี่นาที |

---

### 3. คำแนะนำสำหรับผู้ใช้งาน Free Tier (Best Practices & Tips)

หากต้องการนำ Antigravity Free Tier มาพัฒนาโปรเจกต์ให้มีประสิทธิภาพสูงสุด:

1. **ระวัง "Subagent Cascade"**:
   - หลีกเลี่ยงคำสั่งที่ทำให้ Agent แตกตัวเรียก Subagents ซ้อนกันหลายตัว เพราะแต่ละตัวมีลูป Thinking และ Tool Calls ของตนเอง ซึ่งจะผลาญโควตารายสัปดาห์จนหมดอย่างรวดเร็ว
   - สำหรับงานขนาดเล็ก ให้ระบุสั่งงานโดยตรง เช่น `แก้ไขฟังก์ชัน X ในไฟล์ Y` หรือใช้โหมด `/fast`
2. **ขยันเปิด New Session เพื่อล้าง Context (Clear Context Window Bloat)**:
   - ยิ่งคุยในแชทเดิมนาน Context ย้อนหลังจะยิ่งใหญ่ขึ้นเรื่อยๆ (ทำให้ทุกครั้งที่พิมพ์คำสั่งใหม่ ต้องเสียโควตาซ้ำซ้อน)
   - แนะนำให้เปิด Session แชทใหม่ทุกครั้งเมื่อเริ่ม Milestone ใหม่ เช่น จบงาน Database แล้วเปิดแชทใหม่เริ่มงาน UI
3. **สลับไปใช้ Model ประหยัด (`flash` / `flash_lite`)**:
   - โมเดลเริ่มต้นของระบบคือ **Gemini Pro** ซึ่งใช้พลังประมวลผลสูง
   - สำหรับงานระดับ Presentation, CSS, หรือปรับแก้ข้อความเล็กน้อย สามารถระบุให้ใช้โมเดล **Gemini Flash** ได้ ซึ่งประหยัดโควตากว่า **3 – 5 เท่า**
4. **วางแผนงานแบบแบ่งสัปดาห์ (Weekly Milestone Strategy)**:
   - จัดสรรงานให้สอดคล้องกับรอบ Weekly Reset เช่น:
     - สัปดาห์ที่ 1: ติดตั้งโครงสร้างและฐานข้อมูล (Schema & Migrations)
     - สัปดาห์ที่ 2: สร้างหน้ารายการและระบบเพิ่มครุภัณฑ์ (Assets CRUD)
     - สัปดาห์ที่ 3: พัฒนาระบบยืม-คืนพร้อม Concurrency Safety (Borrow-Return)
     - สัปดาห์ที่ 4: พัฒนา Dashboard สถิติและระบบรายงาน (Dashboard & Reports)

---

## 🎓 โครงการสาธิต (Demo Project Context)

โปรเจกต์นี้ถูกพัฒนาขึ้นเพื่อเป็นตัวอย่างเชิงปฏิบัติ (Case Study & Demo Project) ของหลักสูตร:
👉 **[AI-Ready Developers Workshop](https://github.com/Dhanabhon/ai-ready-developers-workshop)**

มุ่งเน้นการถ่ายทอดเทคนิคการทำงานร่วมกับ AI Coding Assistant (เช่น Spec-Driven Development, Concurrency Row-Level Locking, Enterprise Auth & Middleware, Automated Quality Gates และ Production Deployment)

---

## 📄 ใบอนุญาต (License)

พัฒนาขึ้นเพื่อการใช้งานภายในหน่วยงานราชการและประกอบการศึกษา · จัดทำตามมาตรฐานซอฟต์แวร์ภาครัฐ
