"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  borrowAssetSchema,
  returnAssetSchema,
} from "@/lib/validations/transaction";
import {
  Database,
  AssetStatus,
  ReturnCondition,
  TransactionType,
} from "@/lib/types/database.types";

export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

export type LoanAssetInfo = {
  id: string;
  asset_code: string;
  name: string;
  brand_model: string | null;
  image_url: string | null;
  status: AssetStatus;
};

export type LoanWithAsset = TransactionRow & {
  assets?: LoanAssetInfo | null;
  overdue_days: number;
  is_overdue: boolean;
};

export type AvailableAsset = {
  id: string;
  asset_code: string;
  name: string;
  brand_model: string | null;
  quantity: number;
  available_quantity: number;
  status: AssetStatus;
  location: string | null;
  department: string | null;
  image_url: string | null;
};

export interface GetActiveLoansOptions {
  filter?: "active" | "overdue" | "returned" | "all";
  search?: string;
}

export interface LoanCounts {
  all: number;
  active: number;
  overdue: number;
  returned: number;
}

/**
 * Server action to borrow an asset using concurrency-safe Postgres RPC.
 */
export async function borrowAssetAction(
  formData: FormData
): Promise<{ success?: boolean; transactionId?: string; error?: string }> {
  try {
    const rawData = {
      asset_id: formData.get("asset_id"),
      borrower_name: formData.get("borrower_name"),
      borrower_department: formData.get("borrower_department"),
      due_date: formData.get("due_date"),
      notes: formData.get("notes"),
    };

    const validated = borrowAssetSchema.safeParse(rawData);

    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "ข้อมูลการยืมไม่ถูกต้อง";
      return { error: firstError };
    }

    const supabase = await createClient();

    // Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Call Postgres RPC function `borrow_asset_rpc`
    const { data, error } = await supabase.rpc("borrow_asset_rpc", {
      p_asset_id: validated.data.asset_id,
      p_borrower_name: validated.data.borrower_name,
      p_borrower_dept: validated.data.borrower_department,
      p_due_date: new Date(validated.data.due_date).toISOString(),
      p_notes: validated.data.notes || null,
      p_user_id: user?.id ?? null,
    });

    if (error) {
      console.error("Error in borrow_asset_rpc:", error);
      return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกการยืมครุภัณฑ์" };
    }

    if (!data) {
      return { error: "ไม่สามารถสร้างรายการยืมได้" };
    }

    // Revalidate affected pages
    revalidatePath("/borrow-return");
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    if (validated.data.asset_id) {
      revalidatePath(`/assets/${validated.data.asset_id}`);
    }

    return { success: true, transactionId: data as string };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("Unexpected error in borrowAssetAction:", err);
    return { error: message };
  }
}

/**
 * Server action to return an asset using concurrency-safe Postgres RPC.
 */
export async function returnAssetAction(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawData = {
      transaction_id: formData.get("transaction_id"),
      condition: formData.get("condition") || "good",
      notes: formData.get("notes"),
    };

    const validated = returnAssetSchema.safeParse(rawData);

    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "ข้อมูลการส่งคืนไม่ถูกต้อง";
      return { error: firstError };
    }

    const supabase = await createClient();

    // Call Postgres RPC function `return_asset_rpc`
    const { data, error } = await supabase.rpc("return_asset_rpc", {
      p_transaction_id: validated.data.transaction_id,
      p_condition: validated.data.condition as ReturnCondition,
      p_notes: validated.data.notes || null,
    });

    if (error) {
      console.error("Error in return_asset_rpc:", error);
      return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกการรับคืน" };
    }

    // Revalidate affected pages
    revalidatePath("/borrow-return");
    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("Unexpected error in returnAssetAction:", err);
    return { error: message };
  }
}

interface RawTransactionQueryResult extends TransactionRow {
  assets?: LoanAssetInfo | LoanAssetInfo[] | null;
}

/**
 * Fetch loans/transactions with joined asset details, calculating overdue status and days.
 */
export async function getActiveLoans(
  options: GetActiveLoansOptions = {}
): Promise<LoanWithAsset[]> {
  try {
    const supabase = await createClient();
    const filter = options.filter || "all";
    const nowIso = new Date().toISOString();

    let query = supabase
      .from("transactions")
      .select(
        `
        id,
        asset_id,
        borrower_name,
        borrower_department,
        type,
        borrowed_at,
        due_date,
        returned_at,
        status,
        notes,
        condition_on_return,
        created_by,
        created_at,
        assets (
          id,
          asset_code,
          name,
          brand_model,
          image_url,
          status
        )
      `
      )
      .order("borrowed_at", { ascending: false });

    // Apply database-level filters if requested
    if (filter === "active") {
      query = query.is("returned_at", null);
    } else if (filter === "overdue") {
      query = query.is("returned_at", null).lt("due_date", nowIso);
    } else if (filter === "returned") {
      query = query.not("returned_at", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error in getActiveLoans:", error);
      return [];
    }

    const rawList = (data as unknown as RawTransactionQueryResult[]) || [];
    const now = new Date();

    const formattedList: LoanWithAsset[] = rawList.map((item) => {
      const asset = Array.isArray(item.assets) ? item.assets[0] : item.assets;

      let is_overdue = false;
      let overdue_days = 0;

      if (!item.returned_at && item.due_date) {
        const dueDate = new Date(item.due_date);
        if (dueDate.getTime() < now.getTime()) {
          is_overdue = true;
          const diffMs = now.getTime() - dueDate.getTime();
          overdue_days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      return {
        ...item,
        assets: asset ?? null,
        is_overdue,
        overdue_days,
      };
    });

    // In-memory multi-field search if search query is provided
    if (options.search && options.search.trim() !== "") {
      const term = options.search.trim().toLowerCase();
      return formattedList.filter((loan) => {
        const assetName = loan.assets?.name?.toLowerCase() || "";
        const assetCode = loan.assets?.asset_code?.toLowerCase() || "";
        const borrower = loan.borrower_name?.toLowerCase() || "";
        const dept = loan.borrower_department?.toLowerCase() || "";
        const notes = loan.notes?.toLowerCase() || "";

        return (
          assetName.includes(term) ||
          assetCode.includes(term) ||
          borrower.includes(term) ||
          dept.includes(term) ||
          notes.includes(term)
        );
      });
    }

    return formattedList;
  } catch (err) {
    console.error("Unexpected error in getActiveLoans:", err);
    return [];
  }
}

/**
 * Fetch available assets for walk-in borrow form.
 * Returns assets with available_quantity > 0 and status != 'maintenance'.
 */
export async function getAvailableAssetsForBorrow(): Promise<AvailableAsset[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("assets")
      .select(
        "id, asset_code, name, brand_model, quantity, available_quantity, status, location, department, image_url"
      )
      .gt("available_quantity", 0)
      .neq("status", "maintenance" as AssetStatus)
      .order("asset_code", { ascending: true });

    if (error) {
      console.error("Error fetching available assets:", error);
      return [];
    }

    return (data as AvailableAsset[]) || [];
  } catch (err) {
    console.error("Unexpected error in getAvailableAssetsForBorrow:", err);
    return [];
  }
}
