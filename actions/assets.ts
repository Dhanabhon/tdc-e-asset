"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assetSchema } from "@/lib/validations/asset";
import { Database, AssetStatus, TransactionType } from "@/lib/types/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type AssetRow = Database["public"]["Tables"]["assets"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type AssetWithCategory = AssetRow & {
  category?: {
    id: string;
    name: string;
    prefix_code: string | null;
  } | null;
};

export type AssetDetail = AssetRow & {
  category?: {
    id: string;
    name: string;
    prefix_code: string | null;
  } | null;
  creator?: {
    id: string;
    full_name: string | null;
    email: string;
    department: string | null;
  } | null;
  transactions?: TransactionRow[];
};

export interface GetAssetsOptions {
  search?: string;
  category_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetAssetsResult {
  assets: AssetWithCategory[];
  totalCount: number;
  page: number;
  totalPages: number;
}

/**
 * Fetch all categories ordered by name
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return (data as Category[]) ?? [];
  } catch (err) {
    console.error("Unexpected error fetching categories:", err);
    return [];
  }
}

export interface AssetStatusCounts {
  total: number;
  available: number;
  borrowed: number;
  maintenance: number;
}

/**
 * Fetch counts of assets by status for quick KPI pills
 */
export async function getAssetStatusCounts(): Promise<AssetStatusCounts> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .select("status");

    if (error || !data) {
      return { total: 0, available: 0, borrowed: 0, maintenance: 0 };
    }

    const counts: AssetStatusCounts = {
      total: data.length,
      available: 0,
      borrowed: 0,
      maintenance: 0,
    };

    for (const item of data) {
      if (item.status === "available") counts.available++;
      else if (item.status === "borrowed") counts.borrowed++;
      else if (item.status === "maintenance") counts.maintenance++;
    }

    return counts;
  } catch (err) {
    console.error("Error in getAssetStatusCounts:", err);
    return { total: 0, available: 0, borrowed: 0, maintenance: 0 };
  }
}

interface RawAssetQueryResult extends AssetRow {
  categories?: {
    id: string;
    name: string;
    prefix_code: string | null;
  } | {
    id: string;
    name: string;
    prefix_code: string | null;
  }[] | null;
}

interface RawAssetDetailResult extends AssetRow {
  categories?: {
    id: string;
    name: string;
    prefix_code: string | null;
  } | {
    id: string;
    name: string;
    prefix_code: string | null;
  }[] | null;
  profiles?: {
    id: string;
    full_name: string | null;
    email: string;
    department: string | null;
  } | {
    id: string;
    full_name: string | null;
    email: string;
    department: string | null;
  }[] | null;
  transactions?: TransactionRow[] | null;
}

/**
 * Queries assets table with joined categories, search, filtering, and pagination.
 */
export async function getAssets(options: GetAssetsOptions = {}): Promise<GetAssetsResult> {
  try {
    const supabase = await createClient();

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("assets")
      .select(
        `
        *,
        categories (
          id,
          name,
          prefix_code
        )
      `,
        { count: "exact" }
      );

    // Filter by Category
    if (options.category_id && options.category_id !== "all" && options.category_id.trim() !== "") {
      query = query.eq("category_id", options.category_id.trim());
    }

    // Filter by Status
    if (options.status && options.status !== "all" && options.status.trim() !== "") {
      query = query.eq("status", options.status.trim() as AssetStatus);
    }

    // Multi-field text search
    if (options.search && options.search.trim() !== "") {
      const term = options.search.trim();
      query = query.or(
        `asset_code.ilike.%${term}%,name.ilike.%${term}%,serial_number.ilike.%${term}%,location.ilike.%${term}%,department.ilike.%${term}%,brand_model.ilike.%${term}%`
      );
    }

    // Order and paginate
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error in getAssets:", error);
      return { assets: [], totalCount: 0, page, totalPages: 1 };
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const rawData = (data as unknown as RawAssetQueryResult[]) || [];
    const formattedAssets: AssetWithCategory[] = rawData.map((item) => {
      const cat = Array.isArray(item.categories) ? item.categories[0] : item.categories;
      return {
        ...item,
        category: cat ?? null,
      };
    });

    return {
      assets: formattedAssets,
      totalCount,
      page,
      totalPages,
    };
  } catch (err) {
    console.error("Unexpected error in getAssets:", err);
    return { assets: [], totalCount: 0, page: 1, totalPages: 1 };
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fetches single asset by ID or asset_code with category, creator, and transactions.
 */
export async function getAssetById(idOrCode: string): Promise<AssetDetail | null> {
  if (!idOrCode) return null;

  try {
    const supabase = await createClient();

    let query = supabase
      .from("assets")
      .select(
        `
        *,
        categories (
          id,
          name,
          prefix_code
        ),
        profiles:created_by (
          id,
          full_name,
          email,
          department
        ),
        transactions (
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
          created_at
        )
      `
      );

    if (UUID_REGEX.test(idOrCode)) {
      query = query.or(`id.eq.${idOrCode},asset_code.eq.${idOrCode}`);
    } else {
      query = query.eq("asset_code", idOrCode);
    }

    const { data, error } = await query
      .order("borrowed_at", { referencedTable: "transactions", ascending: false })
      .maybeSingle();

    if (error) {
      console.error("Error in getAssetById:", error);
      return null;
    }

    if (!data) return null;

    const rawData = data as unknown as RawAssetDetailResult;
    const cat = Array.isArray(rawData.categories) ? rawData.categories[0] : rawData.categories;
    const prof = Array.isArray(rawData.profiles) ? rawData.profiles[0] : rawData.profiles;

    return {
      ...rawData,
      category: cat ?? null,
      creator: prof ?? null,
      transactions: rawData.transactions ?? [],
    } as AssetDetail;
  } catch (err) {
    console.error("Unexpected error in getAssetById:", err);
    return null;
  }
}

/**
 * Creates a new asset record in Supabase.
 */
export async function createAsset(
  formData: FormData
): Promise<{ success?: boolean; assetId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const rawData = {
      asset_code: formData.get("asset_code"),
      name: formData.get("name"),
      category_id: formData.get("category_id"),
      brand_model: formData.get("brand_model"),
      serial_number: formData.get("serial_number"),
      quantity: formData.get("quantity"),
      location: formData.get("location"),
      department: formData.get("department"),
      image_url: formData.get("image_url"),
      status: formData.get("status") || "available",
    };

    const validated = assetSchema.safeParse(rawData);

    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "ข้อมูลที่กรอกไม่ถูกต้อง";
      return { error: firstError };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const insertPayload = {
      asset_code: validated.data.asset_code,
      name: validated.data.name,
      category_id: validated.data.category_id,
      brand_model: validated.data.brand_model,
      serial_number: validated.data.serial_number,
      quantity: validated.data.quantity,
      available_quantity: validated.data.quantity,
      status: validated.data.status,
      image_url: validated.data.image_url,
      location: validated.data.location,
      department: validated.data.department,
      created_by: user?.id ?? null,
    };

    const { data, error } = await supabase
      .from("assets")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { error: `รหัสครุภัณฑ์ "${validated.data.asset_code}" มีอยู่ในระบบแล้ว` };
      }
      return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกครุภัณฑ์" };
    }

    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return { success: true, assetId: (data as { id: string }).id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("Error creating asset:", err);
    return { error: message };
  }
}

/**
 * Updates an existing asset record in Supabase.
 */
export async function updateAsset(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; assetId?: string; error?: string }> {
  if (!id) {
    return { error: "ไม่พบรหัสอ้างอิงครุภัณฑ์" };
  }

  try {
    const supabase = await createClient();

    const rawData = {
      asset_code: formData.get("asset_code"),
      name: formData.get("name"),
      category_id: formData.get("category_id"),
      brand_model: formData.get("brand_model"),
      serial_number: formData.get("serial_number"),
      quantity: formData.get("quantity"),
      location: formData.get("location"),
      department: formData.get("department"),
      image_url: formData.get("image_url"),
      status: formData.get("status") || "available",
    };

    const validated = assetSchema.safeParse(rawData);

    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "ข้อมูลที่กรอกไม่ถูกต้อง";
      return { error: firstError };
    }

    // Check existing asset to adjust available_quantity safely
    const { data: existingData } = await supabase
      .from("assets")
      .select("quantity, available_quantity")
      .eq("id", id)
      .single();

    const existing = existingData as { quantity: number; available_quantity: number } | null;

    let newAvailable = validated.data.quantity;
    if (existing) {
      const currentlyBorrowed = Math.max(0, existing.quantity - existing.available_quantity);
      newAvailable = Math.max(0, validated.data.quantity - currentlyBorrowed);
    }

    const updatePayload = {
      asset_code: validated.data.asset_code,
      name: validated.data.name,
      category_id: validated.data.category_id,
      brand_model: validated.data.brand_model,
      serial_number: validated.data.serial_number,
      quantity: validated.data.quantity,
      available_quantity: newAvailable,
      status: validated.data.status,
      image_url: validated.data.image_url,
      location: validated.data.location,
      department: validated.data.department,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("assets")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { error: `รหัสครุภัณฑ์ "${validated.data.asset_code}" ซ้ำกับรายการอื่นในระบบ` };
      }
      return { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตครุภัณฑ์" };
    }

    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath(`/assets/${id}`);

    return { success: true, assetId: id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("Error updating asset:", err);
    return { error: message };
  }
}

/**
 * Deletes an asset after validating no active unreturned borrow transactions exist.
 */
export async function deleteAsset(id: string): Promise<{ success?: boolean; error?: string }> {
  if (!id) {
    return { error: "ไม่พบรหัสอ้างอิงครุภัณฑ์" };
  }

  try {
    const supabase = await createClient();

    // Check if asset currently has active unreturned borrow transactions
    const { data: activeTransactions, error: txError } = await supabase
      .from("transactions")
      .select("id")
      .eq("asset_id", id)
      .eq("type", "borrow" as TransactionType)
      .is("returned_at", null);

    if (txError) {
      console.error("Error checking active transactions:", txError);
    }

    if (activeTransactions && (activeTransactions as unknown as { id: string }[]).length > 0) {
      return { error: "ไม่สามารถลบครุภัณฑ์ที่กำลังถูกยืมได้" };
    }

    // Check asset available quantity vs total quantity or status
    const { data: assetData } = await supabase
      .from("assets")
      .select("status, quantity, available_quantity")
      .eq("id", id)
      .single();

    const asset = assetData as { status: AssetStatus; quantity: number; available_quantity: number } | null;

    if (asset && (asset.status === "borrowed" || asset.available_quantity < asset.quantity)) {
      return { error: "ไม่สามารถลบครุภัณฑ์ที่กำลังถูกยืมได้" };
    }

    const { error: deleteError } = await supabase
      .from("assets")
      .delete()
      .eq("id", id);

    if (deleteError) {
      if (deleteError.code === "23503") {
        return { error: "ไม่สามารถลบได้เนื่องจากมีประวัติธุรกรรมที่เชื่อมโยงกับครุภัณฑ์นี้" };
      }
      return { error: deleteError.message || "เกิดข้อผิดพลาดในการลบครุภัณฑ์" };
    }

    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("Error deleting asset:", err);
    return { error: message };
  }
}
