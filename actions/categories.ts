"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations/category";

export interface CategoryWithStats {
  id: string;
  name: string;
  prefix_code: string | null;
  created_at: string;
  asset_count: number;
  total_quantity: number;
}

export interface CategoriesResult {
  categories: CategoryWithStats[];
  totalCategories: number;
  totalAssetsAssigned: number;
}

/**
 * Fetch all categories with real-time asset counts and quantities.
 */
export async function getCategoriesWithStats(): Promise<CategoriesResult> {
  try {
    const supabase = await createClient();

    // 1. Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (catError || !categories) {
      console.error("Error fetching categories:", catError);
      return { categories: [], totalCategories: 0, totalAssetsAssigned: 0 };
    }

    // 2. Fetch assets for aggregation
    const { data: assets, error: assetError } = await supabase
      .from("assets")
      .select("category_id, quantity");

    const countMap: Record<string, { count: number; totalQty: number }> = {};
    let totalAssetsAssigned = 0;

    if (!assetError && assets) {
      for (const a of assets) {
        if (a.category_id) {
          if (!countMap[a.category_id]) {
            countMap[a.category_id] = { count: 0, totalQty: 0 };
          }
          countMap[a.category_id].count += 1;
          countMap[a.category_id].totalQty += a.quantity || 1;
          totalAssetsAssigned += 1;
        }
      }
    }

    const formattedCategories: CategoryWithStats[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      prefix_code: cat.prefix_code,
      created_at: cat.created_at,
      asset_count: countMap[cat.id]?.count || 0,
      total_quantity: countMap[cat.id]?.totalQty || 0,
    }));

    return {
      categories: formattedCategories,
      totalCategories: formattedCategories.length,
      totalAssetsAssigned,
    };
  } catch (err) {
    console.error("Unexpected error in getCategoriesWithStats:", err);
    return { categories: [], totalCategories: 0, totalAssetsAssigned: 0 };
  }
}

/**
 * Creates a new category.
 */
export async function createCategory(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const rawData = {
      name: formData.get("name"),
      prefix_code: formData.get("prefix_code"),
      description: formData.get("description"),
    };

    const validated = categorySchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" };
    }

    const { error } = await supabase.from("categories").insert({
      name: validated.data.name,
      prefix_code: validated.data.prefix_code,
    });

    if (error) {
      if (error.code === "23505") {
        return { error: `ชื่อหมวดหมู่ "${validated.data.name}" มีอยู่ในระบบแล้ว` };
      }
      return { error: error.message || "เกิดข้อผิดพลาดในการสร้างหมวดหมู่" };
    }

    revalidatePath("/categories");
    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("createCategory error:", err);
    return { error: message };
  }
}

/**
 * Updates an existing category.
 */
export async function updateCategory(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const rawData = {
      name: formData.get("name"),
      prefix_code: formData.get("prefix_code"),
      description: formData.get("description"),
    };

    const validated = categorySchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" };
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name: validated.data.name,
        prefix_code: validated.data.prefix_code,
      })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { error: `ชื่อหมวดหมู่ "${validated.data.name}" มีอยู่ในระบบแล้ว` };
      }
      return { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่" };
    }

    revalidatePath("/categories");
    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("updateCategory error:", err);
    return { error: message };
  }
}

/**
 * Deletes a category if no assets are linked to it.
 */
export async function deleteCategory(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Safety check: Check if any assets currently belong to this category
    const { count, error: countError } = await supabase
      .from("assets")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      console.error("Check linked assets error:", countError);
    }

    if (count && count > 0) {
      return {
        error: `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีครุภัณฑ์ ${count} รายการผูกอยู่ กรุณาย้ายหรือลบครุภัณฑ์ออกก่อนดำเนินการ`,
      };
    }

    // 2. Delete the category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { error: deleteError.message || "เกิดข้อผิดพลาดในการลบหมวดหมู่" };
    }

    revalidatePath("/categories");
    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
    console.error("deleteCategory error:", err);
    return { error: message };
  }
}
