-- TDC e-Asset MVP Initial Schema Migration
-- Timestamp: 20260831_init_schema.sql

-- ============================================================================
-- 1. CUSTOM ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE public.asset_status AS ENUM ('available', 'borrowed', 'maintenance', 'lost');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.transaction_type AS ENUM ('borrow', 'return');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.return_condition AS ENUM ('good', 'damaged_minor', 'damaged_repair', 'lost');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    department TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    prefix_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    brand_model TEXT,
    serial_number TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    available_quantity INT NOT NULL DEFAULT 1 CHECK (available_quantity >= 0 AND available_quantity <= quantity),
    status public.asset_status NOT NULL DEFAULT 'available',
    image_url TEXT,
    location TEXT,
    department TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
    borrower_name TEXT NOT NULL,
    borrower_department TEXT,
    type public.transaction_type NOT NULL DEFAULT 'borrow',
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    condition_on_return public.return_condition,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. TRIGGERS & HELPERS
-- ============================================================================

-- Function to handle new user registration from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.email, ''),
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        'admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_assets_category_id ON public.assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_asset_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);

CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON public.transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON public.transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON public.transactions(created_by);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated users to read profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Categories Policies
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON public.categories;
CREATE POLICY "Allow authenticated users to read categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON public.categories;
CREATE POLICY "Allow authenticated users to insert categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON public.categories;
CREATE POLICY "Allow authenticated users to update categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON public.categories;
CREATE POLICY "Allow authenticated users to delete categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING (true);

-- Assets Policies
DROP POLICY IF EXISTS "Allow authenticated users to read assets" ON public.assets;
CREATE POLICY "Allow authenticated users to read assets"
    ON public.assets FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert assets" ON public.assets;
CREATE POLICY "Allow authenticated users to insert assets"
    ON public.assets FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update assets" ON public.assets;
CREATE POLICY "Allow authenticated users to update assets"
    ON public.assets FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete assets" ON public.assets;
CREATE POLICY "Allow authenticated users to delete assets"
    ON public.assets FOR DELETE
    TO authenticated
    USING (true);

-- Transactions Policies
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON public.transactions;
CREATE POLICY "Allow authenticated users to read transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON public.transactions;
CREATE POLICY "Allow authenticated users to insert transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON public.transactions;
CREATE POLICY "Allow authenticated users to update transactions"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete transactions" ON public.transactions;
CREATE POLICY "Allow authenticated users to delete transactions"
    ON public.transactions FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- 6. STORED PROCEDURES (RPC)
-- ============================================================================

-- Borrow Asset RPC
-- Atomically decrements available_quantity, sets status to 'borrowed' if 0,
-- and creates an active borrow transaction.
CREATE OR REPLACE FUNCTION public.borrow_asset_rpc(
    p_asset_id UUID,
    p_borrower_name TEXT,
    p_borrower_dept TEXT DEFAULT NULL,
    p_due_date TIMESTAMPTZ DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_available INT;
    v_total INT;
    v_status public.asset_status;
    v_new_available INT;
    v_transaction_id UUID;
BEGIN
    -- Row-level lock on assets to prevent concurrent race conditions
    SELECT available_quantity, quantity, status
    INTO v_available, v_total, v_status
    FROM public.assets
    WHERE id = p_asset_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Asset with ID % not found', p_asset_id;
    END IF;

    IF v_status = 'maintenance' THEN
        RAISE EXCEPTION 'Asset is currently under maintenance and cannot be borrowed';
    END IF;

    IF v_available <= 0 THEN
        RAISE EXCEPTION 'Asset is currently unavailable (stock: %)', v_available;
    END IF;

    v_new_available := v_available - 1;

    -- Update asset stock and status
    UPDATE public.assets
    SET
        available_quantity = v_new_available,
        status = CASE
            WHEN v_new_available = 0 THEN 'borrowed'::public.asset_status
            ELSE status
        END,
        updated_at = now()
    WHERE id = p_asset_id;

    -- Create borrow transaction record
    INSERT INTO public.transactions (
        asset_id,
        borrower_name,
        borrower_department,
        type,
        borrowed_at,
        due_date,
        status,
        notes,
        created_by
    )
    VALUES (
        p_asset_id,
        p_borrower_name,
        p_borrower_dept,
        'borrow',
        now(),
        p_due_date,
        'active',
        p_notes,
        p_user_id
    )
    RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Return Asset RPC
-- Atomically increments available_quantity, sets status to 'maintenance' if
-- return condition is 'damaged_repair' else 'available', and marks transaction returned.
CREATE OR REPLACE FUNCTION public.return_asset_rpc(
    p_transaction_id UUID,
    p_condition public.return_condition DEFAULT 'good',
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_asset_id UUID;
    v_tx_status TEXT;
    v_available INT;
    v_total INT;
    v_new_available INT;
    v_new_status public.asset_status;
BEGIN
    -- Row-level lock on transaction
    SELECT asset_id, status
    INTO v_asset_id, v_tx_status
    FROM public.transactions
    WHERE id = p_transaction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction with ID % not found', p_transaction_id;
    END IF;

    IF v_tx_status = 'returned' THEN
        RAISE EXCEPTION 'Transaction % has already been returned', p_transaction_id;
    END IF;

    -- Row-level lock on the associated asset
    SELECT available_quantity, quantity
    INTO v_available, v_total
    FROM public.assets
    WHERE id = v_asset_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated asset not found for transaction %', p_transaction_id;
    END IF;

    IF p_condition = 'lost' THEN
        v_new_status := 'lost'::public.asset_status;
        -- When lost, available quantity is NOT incremented
        v_new_available := v_available;
    ELSIF p_condition = 'damaged_repair' THEN
        v_new_status := 'maintenance'::public.asset_status;
        v_new_available := LEAST(v_available + 1, v_total);
    ELSE
        v_new_status := 'available'::public.asset_status;
        v_new_available := LEAST(v_available + 1, v_total);
    END IF;

    -- Update asset quantity and status
    UPDATE public.assets
    SET
        available_quantity = v_new_available,
        status = v_new_status,
        updated_at = now()
    WHERE id = v_asset_id;

    -- Update transaction record
    UPDATE public.transactions
    SET
        returned_at = now(),
        status = 'returned',
        condition_on_return = p_condition,
        notes = CASE
            WHEN p_notes IS NOT NULL AND p_notes <> '' THEN
                CASE
                    WHEN notes IS NOT NULL AND notes <> '' THEN notes || E'\n[บันทึกการส่งคืน]: ' || p_notes
                    ELSE p_notes
                END
            ELSE notes
        END
    WHERE id = p_transaction_id;

    RETURN p_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution rights to authenticated users & service role
GRANT EXECUTE ON FUNCTION public.borrow_asset_rpc TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.return_asset_rpc TO authenticated, service_role;

-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- Seed 5 Initial Categories
INSERT INTO public.categories (name, prefix_code)
VALUES
    ('คอมพิวเตอร์ตั้งโต๊ะ', '7440'),
    ('เครื่องคอมพิวเตอร์โน้ตบุ๊ก', '7440'),
    ('จอภาพและอุปกรณ์แสดงผล', '7440'),
    ('อุปกรณ์ต่อพ่วงและระบบเครือข่าย', '7730'),
    ('เซิร์ฟเวอร์และอุปกรณ์จัดเก็บข้อมูล', '7440')
ON CONFLICT (name) DO UPDATE
SET prefix_code = EXCLUDED.prefix_code;

-- Seed Initial Mock Assets
INSERT INTO public.assets (
    asset_code,
    name,
    category_id,
    brand_model,
    serial_number,
    quantity,
    available_quantity,
    status,
    image_url,
    location,
    department
)
VALUES
    (
        '7440-001-0001',
        'คอมพิวเตอร์ตั้งโต๊ะ สำหรับงานประมวลผลทั่วไป',
        (SELECT id FROM public.categories WHERE name = 'คอมพิวเตอร์ตั้งโต๊ะ' LIMIT 1),
        'Dell OptiPlex 7090 Tower (Intel Core i7-11700 / 16GB / 512GB SSD)',
        'SN-DELL-7090-001',
        1,
        1,
        'available',
        'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=80',
        'ห้องปฏิบัติการคอมพิวเตอร์ ชั้น 3',
        'สำนักเทคโนโลยีดิจิทัล'
    ),
    (
        '7440-001-0002',
        'คอมพิวเตอร์ตั้งโต๊ะ ประสิทธิภาพสูงสำหรับงานกราฟิก',
        (SELECT id FROM public.categories WHERE name = 'คอมพิวเตอร์ตั้งโต๊ะ' LIMIT 1),
        'HP EliteDesk 800 G8 (Intel Core i9 / 32GB / 1TB NVMe / RTX 3060)',
        'SN-HP-800G8-002',
        1,
        1,
        'available',
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop&q=80',
        'ห้องผลิตสื่อดิจิทัล ชั้น 4',
        'ฝ่ายสื่อสารองค์กร'
    ),
    (
        '7440-002-0001',
        'เครื่องคอมพิวเตอร์โน้ตบุ๊ก สำหรับผู้บริหารและวิทยากร',
        (SELECT id FROM public.categories WHERE name = 'เครื่องคอมพิวเตอร์โน้ตบุ๊ก' LIMIT 1),
        'Lenovo ThinkPad X1 Carbon Gen 10 (Intel Core i7 / 16GB / 512GB)',
        'SN-LNV-X1C-1001',
        1,
        1,
        'available',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
        'ตู้เก็บอุปกรณ์ IT ส่วนกลาง ชั้น 2',
        'สำนักเทคโนโลยีดิจิทัล'
    ),
    (
        '7440-002-0002',
        'เครื่องคอมพิวเตอร์โน้ตบุ๊ก สำหรับพัฒนาระบบ',
        (SELECT id FROM public.categories WHERE name = 'เครื่องคอมพิวเตอร์โน้ตบุ๊ก' LIMIT 1),
        'Apple MacBook Pro 14" (M3 Pro / 18GB / 512GB)',
        'SN-APL-MBP14-002',
        1,
        0,
        'borrowed',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        'ฝ่ายพัฒนาระบบ ชั้น 3',
        'สำนักเทคโนโลยีดิจิทัล'
    ),
    (
        '7440-003-0001',
        'จอภาพแสดงผล 4K Ultra HD 27 นิ้ว',
        (SELECT id FROM public.categories WHERE name = 'จอภาพและอุปกรณ์แสดงผล' LIMIT 1),
        'Dell UltraSharp U2723QE 27" 4K USB-C Hub Monitor',
        'SN-DELL-U2723-001',
        1,
        1,
        'available',
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
        'ห้องประชุมใหญ่ ชั้น 5',
        'กองบริหารกลาง'
    ),
    (
        '7730-001-0001',
        'อุปกรณ์กระจายสัญญาณเครือข่าย Core Switch 24-Port',
        (SELECT id FROM public.categories WHERE name = 'อุปกรณ์ต่อพ่วงและระบบเครือข่าย' LIMIT 1),
        'Cisco Catalyst 2960-X Series 24 Gigabit Ethernet PoE',
        'SN-CSCO-2960X-001',
        1,
        1,
        'available',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
        'ห้อง Server Room อาคาร 1',
        'ฝ่ายโครงสร้างพื้นฐาน'
    ),
    (
        '7440-005-0001',
        'เซิร์ฟเวอร์และอุปกรณ์จัดเก็บข้อมูลเครือข่าย NAS 8-Bay',
        (SELECT id FROM public.categories WHERE name = 'เซิร์ฟเวอร์และอุปกรณ์จัดเก็บข้อมูล' LIMIT 1),
        'Synology RackStation RS1221+ (AMD Ryzen / 16GB RAM / 32TB Storage)',
        'SN-SYN-RS1221-001',
        1,
        1,
        'available',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        'Data Center ชั้น 2',
        'ฝ่ายโครงสร้างพื้นฐาน'
    ),
    (
        '7730-002-0001',
        'เครื่องพิมพ์เลเซอร์ความเร็วสูง รองรับการพิมพ์สองหน้าอัตโนมัติ',
        (SELECT id FROM public.categories WHERE name = 'อุปกรณ์ต่อพ่วงและระบบเครือข่าย' LIMIT 1),
        'HP LaserJet Pro M404dn',
        'SN-HP-M404-001',
        1,
        0,
        'maintenance',
        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80',
        'ฝ่ายพัสดุและบำรุงรักษา',
        'กองบริหารกลาง'
    )
ON CONFLICT (asset_code) DO NOTHING;

-- Seed Initial Mock Borrow Transaction for the borrowed asset
INSERT INTO public.transactions (
    asset_id,
    borrower_name,
    borrower_department,
    type,
    borrowed_at,
    due_date,
    status,
    notes
)
SELECT
    id,
    'สมชาย ใจดี',
    'สำนักเทคโนโลยีดิจิทัล',
    'borrow',
    now() - interval '3 days',
    now() + interval '4 days',
    'active',
    'ยืมสำหรับพัฒนาระบบ TDC e-Asset MVP และทดสอบระบบ'
FROM public.assets
WHERE asset_code = '7440-002-0002'
ON CONFLICT DO NOTHING;
