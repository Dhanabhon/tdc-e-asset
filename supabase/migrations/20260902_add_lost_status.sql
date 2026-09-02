-- Migration: Add 'lost' status safely (handles both fresh and existing databases)
-- Timestamp: 20260902_add_lost_status.sql

-- 1. Create or alter 'asset_status' enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_status') THEN
        CREATE TYPE public.asset_status AS ENUM ('available', 'borrowed', 'maintenance', 'lost');
    ELSE
        ALTER TYPE public.asset_status ADD VALUE IF NOT EXISTS 'lost';
    END IF;
END $$;

-- 2. Create or alter 'return_condition' enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_condition') THEN
        CREATE TYPE public.return_condition AS ENUM ('good', 'damaged_minor', 'damaged_repair', 'lost');
    ELSE
        ALTER TYPE public.return_condition ADD VALUE IF NOT EXISTS 'lost';
    END IF;
END $$;

-- 3. Update return_asset_rpc to support 'lost' condition (only if transactions table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        EXECUTE $fn$
        CREATE OR REPLACE FUNCTION public.return_asset_rpc(
            p_transaction_id UUID,
            p_condition public.return_condition DEFAULT 'good',
            p_notes TEXT DEFAULT NULL
        )
        RETURNS UUID AS $body$
        DECLARE
            v_asset_id UUID;
            v_tx_status TEXT;
            v_available INT;
            v_total INT;
            v_new_available INT;
            v_new_status public.asset_status;
        BEGIN
            SELECT asset_id, status INTO v_asset_id, v_tx_status
            FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

            IF NOT FOUND THEN RAISE EXCEPTION 'Transaction with ID % not found', p_transaction_id; END IF;
            IF v_tx_status = 'returned' THEN RAISE EXCEPTION 'Transaction % has already been returned', p_transaction_id; END IF;

            SELECT available_quantity, quantity INTO v_available, v_total
            FROM public.assets WHERE id = v_asset_id FOR UPDATE;

            IF NOT FOUND THEN RAISE EXCEPTION 'Associated asset not found for transaction %', p_transaction_id; END IF;

            IF p_condition = 'lost' THEN
                v_new_status := 'lost'::public.asset_status;
                v_new_available := v_available;
            ELSIF p_condition = 'damaged_repair' THEN
                v_new_status := 'maintenance'::public.asset_status;
                v_new_available := LEAST(v_available + 1, v_total);
            ELSE
                v_new_status := 'available'::public.asset_status;
                v_new_available := LEAST(v_available + 1, v_total);
            END IF;

            UPDATE public.assets
            SET available_quantity = v_new_available, status = v_new_status, updated_at = now()
            WHERE id = v_asset_id;

            UPDATE public.transactions
            SET returned_at = now(), status = 'returned', condition_on_return = p_condition,
                notes = CASE WHEN p_notes IS NOT NULL AND p_notes <> '' THEN COALESCE(notes || E'\n', '') || '[บันทึกการส่งคืน]: ' || p_notes ELSE notes END
            WHERE id = p_transaction_id;

            RETURN p_transaction_id;
        END;
        $body$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

        GRANT EXECUTE ON FUNCTION public.return_asset_rpc TO authenticated, service_role;
        $fn$;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
