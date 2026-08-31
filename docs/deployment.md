# TDC e-Asset - คู่มือการ Deploy บน Vercel และการตรวจสอบฐานข้อมูล PostgreSQL

เอกสารนี้ระบุขั้นตอนการนำระบบ **TDC e-Asset (MVP)** ขึ้นสู่สภาพแวดล้อมจริง (Production Deployment) บน **Vercel** ร่วมกับ **Supabase** และ **Resend** พร้อมชุดคำสั่ง SQL สำหรับตรวจสอบความสมบูรณ์ของฐานข้อมูล PostgreSQL

---

## 📋 สารบัญ (Table of Contents)
1. [ข้อกำหนดเบื้องต้น (Prerequisites)](#1-ข้อกำหนดเบื้องต้น-prerequisites)
2. [Vercel Deployment Checklist](#2-vercel-deployment-checklist)
3. [การตั้งค่า Supabase และ Resend สำหรับ Production](#3-การตั้งค่า-supabase-และ-resend-สำหรับ-production)
4. [ตัวแปรสภาพแวดล้อม (Environment Variables Reference)](#4-ตัวแปรสภาพแวดล้อม-environment-variables-reference)
5. [ชุดคำสั่ง SQL สำหรับตรวจสอบฐานข้อมูล (Postgres Verification Commands)](#5-ชุดคำสั่ง-sql-สำหรับตรวจสอบฐานข้อมูล-postgres-verification-commands)
6. [การทดสอบความปลอดภัยและการทำงานแบบ Concurrency (Verification Tests)](#6-การทดสอบความปลอดภัยและการทำงานแบบ-concurrency-verification-tests)
7. [Post-Deployment Smoke Test Checklist](#7-post-deployment-smoke-test-checklist)

---

## 1. ข้อกำหนดเบื้องต้น (Prerequisites)

ก่อนเริ่มกระบวนการ Deploy โปรดตรวจสอบว่ามีบัญชีและการตั้งค่าต่อไปนี้ครบถ้วน:
- **GitHub Account**: มีสิทธิ์เข้าถึง Repository `Dhanabhon/tdc-e-asset`
- **Vercel Account**: เชื่อมต่อกับบัญชี GitHub เรียบร้อยแล้ว
- **Supabase Account**: มีโปรเจกต์ Supabase (PostgreSQL 15+) สำหรับ Production
- **Resend Account**: มี API Key และโดเมนอีเมลที่ผ่านการยืนยัน (Verified Domain) หรือใช้อีเมลทดสอบใน Sandbox

---

## 2. Vercel Deployment Checklist

### ขั้นตอนที่ 1: เตรียม Git Repository
- ตรวจสอบว่าโค้ดทั้งหมดผ่านการคอมมิตและ push ไปยัง Branch `main`
- รันคำสั่งตรวจสอบในเครื่องเพื่อยืนยันว่าไม่มีข้อผิดพลาด:
  ```bash
  npx tsc --noEmit
  npm run lint
  npm run build
  ```

### ขั้นตอนที่ 2: นำเข้าโปรเจกต์บน Vercel
1. เข้าสู่หน้า [Vercel Dashboard](https://vercel.com/dashboard)
2. คลิก **Add New...** → **Project**
3. เลือก Repository `tdc-e-asset` จากรายการ GitHub
4. ในส่วน **Framework Preset** เลือก **Next.js**
5. ในส่วน **Root Directory** ให้เลือกเป็น `./` (หรือ root ของโปรเจกต์)
6. **Build & Development Settings**:
   - Build Command: `next build` (ค่าเริ่มต้น)
   - Output Directory: `.next` (ค่าเริ่มต้น)
   - Install Command: `npm install` (ค่าเริ่มต้น)

### ขั้นตอนที่ 3: กำหนดค่า Environment Variables
ในหน้าการตั้งค่าก่อน Deploy ให้เพิ่ม Environment Variables ต่อไปนี้:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL` (กำหนดเป็น `https://<your-project>.vercel.app` หรือ Custom Domain)

### ขั้นตอนที่ 4: Deploy และรับ Production Domain
1. คลิก **Deploy**
2. รอระบบ Build และ Deploy ประมาณ 1–2 นาที
3. คัดลอก Production Domain เช่น `https://tdc-e-asset.vercel.app`

---

## 3. การตั้งค่า Supabase และ Resend สำหรับ Production

### 3.1 การรัน Migration Schema
1. เข้าสู่ **Supabase Dashboard** → เลือกโปรเจกต์ Production
2. ไปที่เมนู **SQL Editor**
3. คัดลอกเนื้อหาจากไฟล์ [`supabase/migrations/20260831_init_schema.sql`](../supabase/migrations/20260831_init_schema.sql)
4. วางลงใน SQL Editor แล้วกด **Run**
5. ตรวจสอบข้อความแจ้งเตือน **"Success. No rows returned"**

### 3.2 การตั้งค่า Custom SMTP ด้วย Resend
เพื่อป้องกันข้อจำกัด Rate Limit ของ Supabase Default Email (3 ฉบับ/ชม.):
1. เข้าสู่ [Resend Dashboard](https://resend.com/api-keys) แล้วคัดลอก **API Key** (ขึ้นต้นด้วย `re_`)
2. ใน Supabase Dashboard ไปที่ **Project Settings** → **Authentication** → **SMTP Settings**
3. เปิดใช้งาน **Enable Custom SMTP**:
   - **Sender email**: อีเมลจากโดเมนของคุณ เช่น `noreply@tdc.go.th` (หรือ `onboarding@resend.dev` ในโหมดทดสอบ)
   - **Sender name**: `TDC e-Asset System`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) หรือ `587` (TLS)
   - **Username**: `resend`
   - **Password**: `<RESEND_API_KEY>`
4. กด **Save** และทดสอบส่งข้อความทดสอบ

### 3.3 การตั้งค่า Authentication Redirect URLs
1. ใน Supabase Dashboard ไปที่ **Authentication** → **URL Configuration**
2. ตั้งค่า **Site URL** เป็น: `https://<your-project>.vercel.app`
3. ในส่วน **Redirect URLs** เพิ่ม:
   - `https://<your-project>.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (สำหรับการพัฒนาในเครื่อง)
4. กด **Save**

---

## 4. ตัวแปรสภาพแวดล้อม (Environment Variables Reference)

| ชื่อตัวแปร | จำเป็น | อธิบาย | ตัวอย่างค่า |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL ของ Supabase Project | `https://abcdefghijklm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon/Public API Key ของ Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |
| `RESEND_API_KEY` | ✅ | API Key จากผู้ให้บริการ Resend | `re_123456789abcdef` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL หลักของเว็บไซต์สำหรับ Redirect Auth | `https://tdc-e-asset.vercel.app` |

---

## 5. ชุดคำสั่ง SQL สำหรับตรวจสอบฐานข้อมูล (Postgres Verification Commands)

รันคำสั่งเหล่านี้ใน **Supabase SQL Editor** เพื่อตรวจสอบความถูกต้องและความพร้อมของระบบ:

### 5.1 ตรวจสอบตารางและโครงสร้างหลัก
```sql
-- 1. ตรวจสอบตารางทั้งหมดใน Schema public
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ผลลัพธ์ที่ถูกต้อง: ต้องมีตาราง assets, categories, profiles, transactions
```

### 5.2 ตรวจสอบ Custom Types และ Enums
```sql
-- 2. ตรวจสอบ Enums
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY enum_name, e.enumsortorder;

-- ผลลัพธ์ที่ถูกต้อง:
-- asset_status: available, borrowed, maintenance
-- return_condition: good, damaged_minor, damaged_repair
-- transaction_type: borrow, return
```

### 5.3 ตรวจสอบ Row Level Security (RLS)
```sql
-- 3. ตรวจสอบว่า RLS เปิดใช้งานครบทุกตาราง
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('assets', 'categories', 'profiles', 'transactions');

-- ผลลัพธ์: ทุกตารางต้องมี rowsecurity = true
```

### 5.4 ตรวจสอบ RLS Policies
```sql
-- 4. ตรวจสอบรายชื่อนโยบาย RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 5.5 ตรวจสอบ Stored Procedures / RPC Functions
```sql
-- 5. ตรวจสอบว่าฟังก์ชัน borrow_asset_rpc และ return_asset_rpc มีอยู่และสิทธิ์ถูกต้อง
SELECT routine_name, routine_type, security_type, data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('borrow_asset_rpc', 'return_asset_rpc', 'handle_new_user');

-- ผลลัพธ์: security_type ต้องเป็น DEFINER
```

### 5.6 ตรวจสอบ Trigger สำหรับผู้ใช้ใหม่
```sql
-- 6. ตรวจสอบ Trigger การสร้าง Profile อัตโนมัติ
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created';
```

### 5.7 ตรวจสอบความถูกต้องของสต็อกและข้อมูลตัวอย่าง
```sql
-- 7. สรุปภาพรวมครุภัณฑ์และสต็อก
SELECT 
    COUNT(*) AS total_assets,
    SUM(quantity) AS total_units,
    SUM(available_quantity) AS total_available_units,
    COUNT(*) FILTER (WHERE status = 'available') AS status_available_count,
    COUNT(*) FILTER (WHERE status = 'borrowed') AS status_borrowed_count,
    COUNT(*) FILTER (WHERE status = 'maintenance') AS status_maintenance_count
FROM public.assets;

-- 8. ตรวจสอบความสอดคล้องของ available_quantity กับ transactions ที่กำลังยืม
SELECT 
    a.asset_code,
    a.name,
    a.quantity,
    a.available_quantity,
    a.status,
    COUNT(t.id) FILTER (WHERE t.returned_at IS NULL) AS active_loans_count
FROM public.assets a
LEFT JOIN public.transactions t ON a.id = t.asset_id
GROUP BY a.id, a.asset_code, a.name, a.quantity, a.available_quantity, a.status
ORDER BY a.asset_code;
```

---

## 6. การทดสอบความปลอดภัยและการทำงานแบบ Concurrency (Verification Tests)

### 6.1 ทดสอบการยืมและคืนผ่าน RPC Function ใน SQL Editor
```sql
-- ทดสอบการยืมครุภัณฑ์ผ่าน RPC (เลือก Asset ID ที่มีสต็อกว่าง)
DO $$
DECLARE
    v_test_asset_id UUID;
    v_new_tx_id UUID;
BEGIN
    SELECT id INTO v_test_asset_id 
    FROM public.assets 
    WHERE available_quantity > 0 
    LIMIT 1;

    IF v_test_asset_id IS NOT NULL THEN
        -- เรียกใช้งาน borrow_asset_rpc
        v_new_tx_id := public.borrow_asset_rpc(
            p_asset_id := v_test_asset_id,
            p_borrower_name := 'ทดสอบระบบ อัตโนมัติ',
            p_borrower_dept := 'ฝ่ายพัฒนาระบบ',
            p_due_date := now() + interval '7 days',
            p_notes := 'ทดสอบ RPC Function'
        );
        RAISE NOTICE 'Borrow RPC Successful! Transaction ID: %', v_new_tx_id;

        -- เรียกใช้งาน return_asset_rpc เพื่อคืนทันที
        PERFORM public.return_asset_rpc(
            p_transaction_id := v_new_tx_id,
            p_condition := 'good'::public.return_condition,
            p_notes := 'ทดสอบการส่งคืนสำเร็จ'
        );
        RAISE NOTICE 'Return RPC Successful!';
    END IF;
END $$;
```

### 6.2 กลไกป้องกัน Race Condition ด้วย `FOR UPDATE`
ในฟังก์ชัน `borrow_asset_rpc` มีคำสั่ง:
```sql
SELECT available_quantity, quantity, status
INTO v_available, v_total, v_status
FROM public.assets
WHERE id = p_asset_id
FOR UPDATE;
```
คำสั่ง `FOR UPDATE` จะทำการล็อกแถวของครุภัณฑ์เป้าหมายไว้ชั่วคราวระหว่างประมวลผลธุรกรรม หากมี request อื่นเข้ามาพร้อมกัน จะต้องรอให้คำสั่งแรกเสร็จสิ้นก่อน จึงรับประกันว่าจะไม่มีกรณี **สต็อกติดลบ (Overdraft)** หรือ **สต็อกค้าง** เด็ดขาด

---

## 7. Post-Deployment Smoke Test Checklist

หลังจากการ Deploy บน Vercel เสร็จสิ้น ให้ทดสอบเส้นทางการใช้งานจริง (E2E User Journey):

- [ ] **1. Public Landing Page (`/`)**:
  - หน้าเว็บโหลดได้สมบูรณ์ แสดงโลโก้ เมนู คุณสมบัติ 3 ระบบหลัก และปุ่ม Call-to-Action
- [ ] **2. Authentication Flow (`/login`)**:
  - กรอกอีเมลเจ้าหน้าที่ กดส่ง Magic Link / OTP
  - ได้รับอีเมลจาก Resend SMTP ภายใน 10 วินาที
  - คลิกลิงก์ยืนยันในอีเมลแล้ว Redirect เข้าสู่ `/dashboard` สำเร็จ
- [ ] **3. Edge Middleware Guard**:
  - ลองเปิดหน้าต่าง Incognito แล้วพิมพ์ URL `https://<domain>/dashboard` หรือ `https://<domain>/assets`
  - ตรวจสอบว่าระบบ Redirect ไปที่ `/login` อัตโนมัติ
- [ ] **4. Dashboard Overview (`/dashboard`)**:
  - แสดงการ์ดสถิติ 4 มิติ (ครุภัณฑ์ทั้งหมด, พร้อมใช้งาน, ถูกยืม, ซ่อมบำรุง) ถูกต้อง
  - แสดงแถบเตือนครุภัณฑ์เกินกำหนด (ถ้ามีรายการ overdue)
  - ตาราง 10 ธุรกรรมล่าสุดแสดงรายการถูกต้อง
- [ ] **5. Asset Management (`/assets`)**:
  - ค้นหาและกรองครุภัณฑ์ตามหมวดหมู่และสถานะ
  - เพิ่มครุภัณฑ์ใหม่ (`/assets/new`) พร้อมระบุรหัส, ชื่อ, จำนวน, สถานที่จัดเก็บ
  - ตรวจสอบหน้ารายละเอียดครุภัณฑ์ (`/assets/[id]`) และการแก้ไขข้อมูล (`/assets/[id]/edit`)
- [ ] **6. Borrow & Return Management (`/borrow-return`)**:
  - ทำรายการยืม Walk-in: เลือกครุภัณฑ์ กรอกชื่อผู้ยืม แผนก กำหนดคืน และกดบันทึก
  - ตรวจสอบว่าสต็อกคงเหลือในหน้ารายการลดลงทันที
  - กดปุ่ม **รับคืน** ในตาราง เลือกสภาพเป็น **"ปกติ"** ยืนยันแล้วสต็อกกลับมาเพิ่มขึ้น
  - ทดสอบรับคืนแบบเลือกสภาพเป็น **"ชำรุด ส่งซ่อม"** ยืนยันว่าสถานะครุภัณฑ์เปลี่ยนเป็น `ซ่อมบำรุง`
- [ ] **7. Reports & Summary (`/reports`)**:
  - ตรวจสอบตารางสรุปครุภัณฑ์ตามหมวด/สถานะ และมูลค่ารวมทางบัญชี

---

🎉 **ระบบ TDC e-Asset พร้อมสำหรับการปฏิบัติงานบน Production อย่างเป็นทางการ**
