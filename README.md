# TDC e-Asset - ระบบบริหารจัดการครุภัณฑ์หน่วยงานราชการ (MVP)

[![Build Status](https://github.com/Dhanabhon/tdc-e-asset/actions/workflows/deploy.yml/badge.svg)](https://github.com/Dhanabhon/tdc-e-asset/actions/workflows/deploy.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com)

> **TDC e-Asset** แพลตฟอร์มบริหารจัดการครุภัณฑ์และสินทรัพย์ไอทีสำหรับหน่วยงานราชการ บันทึกทะเบียนพัสดุ ติดตามการยืม–คืนออนไลน์ ป้องกันสต็อกติดลบด้วย Concurrency Row-Level Lock และรายงานสรุปข้อมูลแบบเรียลไทม์

> [!NOTE]
> **Demo Project:** โครงการนี้เป็นโปรเจกต์สาธิต (Demo Project) สำหรับหลักสูตรและเวิร์กช็อป **[AI-Ready Developers Workshop](https://github.com/Dhanabhon/ai-ready-developers-workshop)** เพื่อสาธิตการออกแบบ พัฒนา และส่งมอบระบบจริงร่วมกับ AI โดยใช้สถาปัตยกรรมระดับองค์กร (Next.js 16 App Router + Supabase PostgreSQL + Resend + Vercel)

---

## จุดเด่นและคุณสมบัติหลัก (Key Features)

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

## เทคโนโลยีที่ใช้ (Tech Stack)

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

## สถาปัตยกรรมระบบ (Architecture Summary)

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

## โครงสร้างโปรเจกต์ (Project Structure)

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

## เริ่มต้นใช้งานอย่างรวดเร็ว (Quick Start Guide)

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

## การตรวจสอบคุณภาพโค้ด (Testing & Quality Gates)

```bash
# ตรวจสอบ TypeScript Type Safety
npx tsc --noEmit

# ตรวจสอบ ESLint Rules (0 errors, 0 warnings)
npm run lint

# ทดสอบ Production Build
npm run build
```

---

## การ Deploy สู่ Vercel (Production Deployment)

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

## สถิติการพัฒนาด้วย AI และการบริหารโควตา (AI Metrics & Quota Analysis)

โครงการนี้ถูกพัฒนาขึ้นด้วยกระบวนการ Autonomous Agentic Coding ร่วมกับระบบ Google Antigravity (AGY) โดยมีสถิติการใช้งานจริงและข้อพิจารณาเรื่องโควตาการใช้งานดังนี้:

### 1. สถิติการใช้ Tokens ในโครงการนี้ (Actual Project Metrics)

* **โมเดล AI หลักและ Subagents:** Google Gemini 2.5 Pro (เปิดระบบ Thinking / Chain-of-Thought เพื่อวางแผนและตรวจสอบโค้ดเชิงลึก)
* **สถาปัตยกรรม Agentic:** 1 Main Orchestrator ร่วมกับ 12 Specialized Subagents (วิศวกรเฉพาะทางและผู้ตรวจสอบ Spec Compliance)
* **จำนวนรอบการคิดและการทำงาน (Total Steps / API Turns):** 1,997 Steps
* **Output Tokens ที่ AI สร้างขึ้นจริง:** ประมาณ 1,228,765 Tokens (~1.23 ล้าน Tokens / 4.42 ล้านตัวอักษร)
* **Cumulative Context Tokens:** ประมาณ 280M – 330M Tokens (คำนวณจากประวัติการสนทนา โค้ดที่อ่านวิเคราะห์ และผลการรันคำสั่ง Terminal สะสมตลอดเกือบ 2,000 รอบ)

#### การแบ่งสัดส่วนการทำงานระหว่าง Main Agent และ Subagents

| บทบาท (Agent Role) | จำนวน Steps ที่ทำงาน | Output Tokens ที่สร้าง |
| :--- | :---: | :---: |
| Main Agent (Orchestrator & Coordinator) | 1,038 | ~579,035 |
| Subagent 1: Database & Infrastructure Engineer | 106 | ~51,129 |
| Subagent 2: Spec Compliance Reviewer (DB) | 28 | ~13,942 |
| Subagent 3: Auth & Middleware Engineer | 119 | ~68,216 |
| Subagent 4: Spec Compliance Reviewer (Auth) | 33 | ~21,622 |
| Subagent 5: Asset Feature Engineer | 140 | ~94,866 |
| Subagent 6: Spec Compliance Reviewer (Asset) | 33 | ~31,666 |
| Subagent 7: Borrow-Return Feature Engineer | 106 | ~61,678 |
| Subagent 8: Spec Compliance Reviewer (Borrow-Return) | 37 | ~27,649 |
| Subagent 9: Dashboard Feature Engineer | 90 | ~65,185 |
| Subagent 10: Spec Compliance Reviewer (Dashboard) | 37 | ~25,331 |
| Subagent 11: Documentation & Verification Engineer | 107 | ~78,122 |
| Subagent 12: Final Code Reviewer | 123 | ~110,317 |
| **รวมทั้งสิ้น (Total)** | **1,997 Steps** | **~1,228,765 Tokens** |

---

### 2. การประเมินการใช้งานบน Google Antigravity: Pro vs. Free Tier

ระบบ Antigravity คำนวณโควตาจาก Compute Effort (ภาระงานที่ Agent ทำ เช่น การค้นหาไฟล์ทั้งระบบ การสร้างไฟล์ใหม่ การคอมไพล์โค้ด และการแตก Subagents) ซึ่งกินทรัพยากรมากกว่าการถามตอบทั่วไปหลายเท่าตัว

| มิติการเปรียบเทียบ | Google AI Pro / Ultra Tier | Antigravity Free Tier (Individual) |
| :--- | :--- | :--- |
| **กลไกการรีเฟรชโควตา (Refresh Cycle)** | ทุก 5 ชั่วโมง (Rolling 5-Hour Window) | รายสัปดาห์ (Weekly Rate Limit Bucket) |
| **ขีดความสามารถต่อรอบ** | สูงมาก รองรับการทำงานต่อเนื่องได้ทั้งวัน | ~50 – 100 Steps ต่อสัปดาห์ (~50k–80k tokens) |
| **จำนวนรอบ Reset เพื่อจบโปรเจกต์นี้** | 2 – 3 รอบ | ประมาณ 15 – 20 รอบสัปดาห์ |
| **ระยะเวลาจริงที่ต้องใช้** | 1 – 2 วัน | ประมาณ 3 – 5 เดือน (หากรอ Weekly Reset) |
| **การรองรับ Multi-Subagent** | รองรับการรัน Subagent ขนานกันได้เต็มรูปแบบ | เสี่ยงติดโควตาหมดทันทีภายในไม่กี่นาที |

---

### 3. คำแนะนำสำหรับผู้ใช้งาน Free Tier (Best Practices & Tips)

หากต้องการนำ Antigravity Free Tier มาพัฒนาโปรเจกต์ให้มีประสิทธิภาพสูงสุด:

1. **ระวัง Subagent Cascade:** หลีกเลี่ยงคำสั่งที่ทำให้ Agent แตกตัวเรียก Subagents ซ้อนกันหลายตัว เพราะแต่ละตัวมีลูป Thinking และ Tool Calls ของตนเอง ซึ่งจะทำให้โควตารายสัปดาห์หมดลงอย่างรวดเร็ว สำหรับงานขนาดเล็กให้สั่งงานโดยตรง เช่น แก้ไขฟังก์ชันในไฟล์ที่ระบุ หรือใช้โหมดเร็ว
2. **เปิด Session ใหม่เพื่อล้าง Context สะสม:** ยิ่งคุยในแชทเดิมนาน Context ย้อนหลังจะยิ่งใหญ่ขึ้นเรื่อยๆ ทำให้ทุกครั้งที่พิมพ์คำสั่งใหม่ ต้องเสียโควตาคำนวณซ้ำซ้อน แนะนำให้เปิด Session แชทใหม่ทุกครั้งเมื่อเริ่มงานส่วนใหม่
3. **สลับไปใช้ Model ขนาดเล็กสำหรับงานทั่วไป:** โมเดลเริ่มต้นของระบบคือ Gemini Pro ซึ่งใช้พลังประมวลผลสูง สำหรับงานระดับ UI, CSS หรือปรับแก้ข้อความเล็กน้อย สามารถระบุให้ใช้โมเดล Gemini Flash ได้ ซึ่งประหยัดโควตากว่า 3 ถึง 5 เท่า
4. **วางแผนงานแบบแบ่งสัปดาห์:** จัดสรรงานให้สอดคล้องกับรอบรีเซ็ตรายสัปดาห์ เช่น สัปดาห์แรกติดตั้งโครงสร้างและฐานข้อมูล สัปดาห์ถัดมาทำหน้ารายการครุภัณฑ์ จากนั้นทำระบบยืมคืน และปิดท้ายด้วย Dashboard กับรายงาน

---

## แนวทางการพัฒนาต่อยอด (Future Roadmap)

ระบบ TDC e-Asset ในปัจจุบันเป็นเวอร์ชันขั้นต้น (MVP) ที่เน้นความถูกต้องของข้อมูลพื้นฐานและการป้องกันข้อผิดพลาดในการยืมคืน สำหรับการนำไปใช้งานจริงในหน่วยงานราชการ มีฟังก์ชันที่ออกแบบไว้เพื่อพัฒนาต่อยอดดังนี้:

### 1. ระบบจัดการสิทธิ์การเข้าถึงแบบละเอียด (Role-Based Access Control - RBAC)
ปัจจุบันหน้าจอผู้ดูแลระบบ (`/admin`) มีหน้าตาจำลองบทบาทผู้ใช้งานไว้แล้ว แต่ในฝั่งฐานข้อมูลยังให้สิทธิ์ผู้ใช้งานที่ล็อกอินแล้วเข้าถึงข้อมูลได้เท่ากัน ในขั้นต่อไปจะแยกระดับสิทธิ์และการเข้าถึงเมนูอย่างชัดเจน:
- **ผู้ดูแลระบบ (Super Admin):** มีสิทธิ์จัดการบัญชีผู้ใช้งาน กำหนดบทบาท ลบหมวดหมู่ ลบครุภัณฑ์ และตั้งค่าระบบ
- **เจ้าหน้าที่พัสดุ (Property Officer):** เพิ่มและแก้ไขข้อมูลครุภัณฑ์ บันทึกการยืมคืน ตรวจสอบสภาพของ และพิมพ์รายงานหรือสติกเกอร์บาร์โค้ด แต่ไม่สามารถลบข้อมูลสำคัญหรือจัดการบัญชีผู้ใช้อื่นได้
- **ผู้ตรวจสอบหรือผู้บริหาร (Auditor / Executive):** มีสิทธิ์ดูข้อมูลทุกหน้า พิมพ์รายงาน และส่งออกข้อมูลเป็น Excel หรือ PDF แต่ไม่สามารถแก้ไขข้อมูลได้
- **บุคลากรทั่วไป (Staff / General User):** ดูเฉพาะรายการครุภัณฑ์ที่พร้อมใช้งาน และดูประวัติการยืมของตนเองเท่านั้น
- **การนำไปใช้งานจริง:** กำหนดสิทธิ์ระดับตารางฐานข้อมูลผ่าน PostgreSQL Row Level Security (RLS) ร่วมกับ Next.js Middleware และ Server Actions

### 2. ระบบยื่นคำขอยืมและอนุมัติออนไลน์ (Borrow Request & Approval Workflow)
จากเดิมที่เจ้าหน้าที่พัสดุเป็นผู้บันทึกรายการยืมแบบ Walk-in ฝ่ายเดียว จะขยายให้บุคลากรสามารถค้นหาครุภัณฑ์ที่ต้องการและกดยื่นคำขอยืมล่วงหน้าผ่านระบบได้ โดยมีขั้นตอน:
- ผู้ยืมเลือกรายการ ระบุวัตถุประสงค์ และวันที่ต้องการใช้งาน
- ระบบแจ้งเตือนไปยังหัวหน้างานหรือเจ้าหน้าที่พัสดุเพื่อพิจารณาอนุมัติหรือปฏิเสธ
- เมื่อได้รับการอนุมัติ ผู้ยืมจึงเดินทางมารับอุปกรณ์จริง พร้อมรับใบยืมดิจิทัลทางอีเมล

### 3. ระบบสแกน QR Code และ Barcode ผ่านกล้องเว็บและมือถือ
ระบบมีฟังก์ชันพิมพ์สติกเกอร์รหัส Code 128 และ QR Code แล้ว ขั้นต่อไปคือการเพิ่มระบบสแกนผ่านกล้องของอุปกรณ์ (HTML5 Web Camera Scanner) เพื่อให้เจ้าหน้าที่เปิดเว็บผ่านโทรศัพท์มือถือหรือแท็บเล็ตแล้วยิงสแกนป้ายครุภัณฑ์เพื่อเปิดหน้าข้อมูลหรือทำรายการรับคืนได้ทันที โดยไม่ต้องพิมพ์ค้นหา

### 4. ระบบคำนวณค่าเสื่อมราคาทางบัญชี (Asset Depreciation Engine)
พัฒนาการคำนวณค่าเสื่อมราคาสะสมวิธีเส้นตรง (Straight-Line Depreciation) ตามเกณฑ์และระเบียบกระทรวงการคลัง:
- ระบุอายุการใช้งานและอัตราค่าเสื่อมราคาตามประเภทครุภัณฑ์ (เช่น อุปกรณ์คอมพิวเตอร์ 3-5 ปี) กำหนดมูลค่าซาก 1 บาท
- คำนวณมูลค่าสุทธิทางบัญชี ณ ปัจจุบัน (Net Book Value) แบบอัตโนมัติ เพื่อออกรายงานสำหรับส่งฝ่ายการเงินและบัญชี

### 5. ระบบบันทึกประวัติการส่งซ่อมและบำรุงรักษา (Maintenance History & Ticketing)
เมื่อครุภัณฑ์มีสถานะส่งซ่อม จะมีหน้าจอสำหรับเปิดใบแจ้งซ่อม บันทึกอาการชำรุด บริษัทหรือศูนย์บริการที่รับซ่อม วันที่ส่งซ่อม วันที่คาดว่าจะได้รับคืน ค่าใช้จ่ายในการซ่อม และบันทึกประวัติการเปลี่ยนอะไหล่ เพื่อใช้ประเมินความคุ้มค่าในการใช้งานอุปกรณ์

### 6. ระบบแจ้งเตือนกำหนดส่งคืนอัตโนมัติ (Automated Overdue Notifications)
ตั้งระบบตั้งเวลาทำงานอัตโนมัติ (Cron Job) ตรวจสอบรายการยืมพัสดุทุกวัน:
- ส่งอีเมลแจ้งเตือนผู้ยืมล่วงหน้า 1 วันก่อนถึงกำหนดส่งคืน
- ส่งอีเมลแจ้งเตือนเมื่อเกินกำหนดส่งคืน (Overdue) ไปยังผู้ยืมและเจ้าหน้าที่พัสดุ เพื่อลดปัญหาครุภัณฑ์สูญหายหรือค้างส่งคืน

---

## ข้อพิจารณาด้านความมั่นคงปลอดภัย (Security & Compliance Roadmap)

เพื่อให้ระบบมีความปลอดภัยตามมาตรฐานสถาปัตยกรรมภาครัฐและสอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) มีข้อพิจารณาที่ต้องนำไปปฏิบัติเพิ่มเติมดังนี้:

### 1. การกำหนดนโยบาย Row Level Security (RLS) ตามบทบาท
ปัจจุบันนโยบาย RLS ในฐานข้อมูลยังเปิดกว้างสำหรับผู้ใช้ที่ล็อกอินแล้ว ในขั้นต่อไปจะต้องปรับนโยบายให้ตรวจสอบบทบาทของผู้ใช้จาก JWT Claims โดยตรง:
- ตาราง categories และ assets: อนุญาตให้เฉพาะบทบาท admin และ officer แก้ไขข้อมูลได้
- การลบข้อมูลครุภัณฑ์และหมวดหมู่: จำกัดเฉพาะบทบาท admin เท่านั้น

### 2. ระบบบันทึกประวัติการแก้ไขข้อมูลที่ไม่สามารถเปลี่ยนแปลงได้ (Immutable Audit Trail)
สร้างตาราง audit_logs ร่วมกับ PostgreSQL Triggers เพื่อดักจับทุกการกระทำ (สร้าง, แก้ไข, ลบ) บนข้อมูลสำคัญ:
- บันทึกรหัสผู้ใช้งาน, หมายเลขไอพี, วันเวลา, ค่าก่อนแก้ไข และค่าหลังแก้ไข
- ตารางนี้จะถูกตั้งค่าห้ามแก้ไขหรือลบย้อนหลัง เพื่อใช้เป็นหลักฐานในการตรวจสอบทางวินัยและบัญชีพัสดุของหน่วยงาน

### 3. การป้องกันการโจมตีและการยิงคำขอซ้ำซ้อน (Rate Limiting & Bot Protection)
- ติดตั้งระบบตรวจสอบบอต เช่น Cloudflare Turnstile ที่หน้าเข้าสู่ระบบ เพื่อป้องกันไม่ให้มีผู้ใช้บอตยิงขอรหัส OTP หรือ Magic Link รบกวนเซิร์ฟเวอร์อีเมล
- กำหนด Rate Limit บน Edge Middleware จำกัดจำนวนครั้งในการส่งคำขอต่อ IP และต่ออีเมล
- จำกัดความถี่ในการอัปโหลดไฟล์รูปภาพเพื่อป้องกันการโจมตีแบบส่งข้อมูลปริมาณมาก (Denial-of-Service)

### 4. การตรวจสอบความปลอดภัยของไฟล์ที่อัปโหลด (File Upload Hardening)
- การตรวจสอบประเภทไฟล์รูปภาพที่อัปโหลดเข้า Supabase Storage จะต้องตรวจลึกถึงระดับไส้ในของไฟล์ (Magic Bytes Sniffing) บนเซิร์ฟเวอร์ ไม่พึ่งพาเพียงนามสกุลไฟล์หรือค่า MIME Type ที่ส่งมาจากเบราว์เซอร์ เพื่อป้องกันการอัปโหลดไฟล์อันตราย
- ตั้งค่าจำกัดขนาดไฟล์ไม่เกิน 5 MB และอนุญาตเฉพาะฟอร์แมตภาพมาตรฐานเท่านั้น

### 5. การยืนยันตัวตนสองชั้นสำหรับผู้ดูแลระบบ (Multi-Factor Authentication - MFA)
เพิ่มการยืนยันตัวตนแบบสองขั้นตอน (เช่น แอปรหัสผ่านชั่วคราว TOTP หรือ Passkey) สำหรับผู้ใช้งานระดับผู้ดูแลระบบ ก่อนเข้าถึงการตั้งค่าส่วนกลางหรือการกดลบข้อมูลสำคัญ เพื่อลดความเสี่ยงกรณีอีเมลถูกเข้าถึงโดยไม่ได้รับอนุญาต

### 6. นโยบายความปลอดภัยของส่วนหัวเว็บไซต์ (HTTP Security Headers & CSP)
กำหนดค่า Content Security Policy (CSP) และ Security Headers ในเซิร์ฟเวอร์:
- ป้องกันการดึงรูปภาพจากแหล่งภายนอกที่ไม่น่าเชื่อถือ โดยอนุญาตเฉพาะโดเมน Supabase Storage ที่กำหนด
- ตั้งค่าป้องกันการนำหน้าเว็บไปแสดงใน iframe ของเว็บไซต์อื่น (X-Frame-Options: DENY)
- ตั้งค่าป้องกันการเดาประเภทข้อมูล (X-Content-Type-Options: nosniff)

---

## โครงการสาธิต (Demo Project Context)

โปรเจกต์นี้ถูกพัฒนาขึ้นเพื่อเป็นตัวอย่างเชิงปฏิบัติ (Case Study & Demo Project) ของหลักสูตร:
[AI-Ready Developers Workshop](https://github.com/Dhanabhon/ai-ready-developers-workshop)

มุ่งเน้นการถ่ายทอดเทคนิคการทำงานร่วมกับ AI Coding Assistant (เช่น Spec-Driven Development, Concurrency Row-Level Locking, Enterprise Auth & Middleware, Automated Quality Gates และ Production Deployment)

---

## ใบอนุญาต (License)

พัฒนาขึ้นเพื่อการใช้งานภายในหน่วยงานราชการและประกอบการศึกษา · จัดทำตามมาตรฐานซอฟต์แวร์ภาครัฐ

