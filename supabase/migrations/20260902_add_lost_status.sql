-- Migration: Add 'lost' status to asset_status and return_condition enums
-- Timestamp: 20260902_add_lost_status.sql

-- 1. Add 'lost' to asset_status enum (if not exists)
DO $$ 
BEGIN
    ALTER TYPE public.asset_status ADD VALUE IF NOT EXISTS 'lost';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add 'lost' to return_condition enum (if not exists)
DO $$ 
BEGIN
    ALTER TYPE public.return_condition ADD VALUE IF NOT EXISTS 'lost';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Update return_asset_rpc to support 'lost' condition
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

    -- Determine new status and available quantity
    IF p_condition = 'lost' THEN
        v_new_status := 'lost'::public.asset_status;
        -- For lost assets, available_quantity is NOT restored
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

-- Ensure execution rights
GRANT EXECUTE ON FUNCTION public.return_asset_rpc TO authenticated, service_role;

-- Reload Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
