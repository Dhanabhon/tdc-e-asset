"use server";

import { createClient } from "@/lib/supabase/server";

export interface CategoryReportRow {
  categoryId: string;
  categoryName: string;
  prefixCode: string | null;
  availableCount: number;
  borrowedCount: number;
  maintenanceCount: number;
  lostCount: number;
  totalCount: number;
  totalQuantity: number;
}

export interface OverdueReportRow {
  transactionId: string;
  assetCode: string;
  assetName: string;
  borrowerName: string;
  borrowerDept: string;
  borrowedAt: string;
  dueDate: string;
  overdueDays: number;
}

export interface LoanReportRow {
  transactionId: string;
  assetCode: string;
  assetName: string;
  borrowerName: string;
  borrowerDept: string;
  borrowedAt: string;
  dueDate: string | null;
  returnedAt: string | null;
  status: string;
  condition: string | null;
}

export interface ReportTotals {
  totalCategories: number;
  totalAssets: number;
  totalAvailable: number;
  totalBorrowed: number;
  totalMaintenance: number;
  totalLost: number;
  totalOverdue: number;
}

export interface ReportsDataResult {
  categoriesSummary: CategoryReportRow[];
  overdueLoans: OverdueReportRow[];
  recentLoans: LoanReportRow[];
  totals: ReportTotals;
  generatedBy: {
    name: string;
    department: string;
    email: string;
  };
}

/**
 * Fetches real aggregated data for reporting.
 */
export async function getReportsData(): Promise<ReportsDataResult> {
  try {
    const supabase = await createClient();

    // 1. Fetch current user profile
    const { data: { user } } = await supabase.auth.getUser();
    let generatedByName = user?.user_metadata?.full_name || "เจ้าหน้าที่พัสดุ";
    let generatedByDept = user?.user_metadata?.department || "สำนักเทคโนโลยีดิจิทัล";
    const generatedByEmail = user?.email || "";

    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, department")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) generatedByName = profile.full_name;
      if (profile?.department) generatedByDept = profile.department;
    }

    // 2. Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, prefix_code")
      .order("name", { ascending: true });

    // 3. Fetch all assets
    const { data: assets } = await supabase
      .from("assets")
      .select("id, category_id, status, quantity, available_quantity");

    // 4. Fetch transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select(`
        id,
        borrower_name,
        borrower_department,
        type,
        borrowed_at,
        due_date,
        returned_at,
        status,
        condition_on_return,
        assets:asset_id (
          id,
          asset_code,
          name
        )
      `)
      .order("borrowed_at", { ascending: false });

    // 5. Aggregate category summary
    const catMap: Record<string, CategoryReportRow> = {};

    if (categories) {
      for (const cat of categories) {
        catMap[cat.id] = {
          categoryId: cat.id,
          categoryName: cat.name,
          prefixCode: cat.prefix_code,
          availableCount: 0,
          borrowedCount: 0,
          maintenanceCount: 0,
          lostCount: 0,
          totalCount: 0,
          totalQuantity: 0,
        };
      }
    }

    // Uncategorized bucket if any
    const uncategorizedKey = "uncategorized";
    catMap[uncategorizedKey] = {
      categoryId: uncategorizedKey,
      categoryName: "ไม่ระบุหมวดหมู่",
      prefixCode: "-",
      availableCount: 0,
      borrowedCount: 0,
      maintenanceCount: 0,
      lostCount: 0,
      totalCount: 0,
      totalQuantity: 0,
    };

    let totalAvailable = 0;
    let totalBorrowed = 0;
    let totalMaintenance = 0;
    let totalLost = 0;
    let totalAssets = 0;

    if (assets) {
      for (const a of assets) {
        const target = a.category_id && catMap[a.category_id] ? catMap[a.category_id] : catMap[uncategorizedKey];
        target.totalCount += 1;
        target.totalQuantity += a.quantity || 1;
        totalAssets += 1;

        if (a.status === "available") {
          target.availableCount += 1;
          totalAvailable += 1;
        } else if (a.status === "borrowed") {
          target.borrowedCount += 1;
          totalBorrowed += 1;
        } else if (a.status === "maintenance") {
          target.maintenanceCount += 1;
          totalMaintenance += 1;
        } else if (a.status === "lost") {
          target.lostCount += 1;
          totalLost += 1;
        }
      }
    }

    // Filter out uncategorized if count is 0
    const categoriesSummary = Object.values(catMap).filter(
      (c) => c.categoryId !== uncategorizedKey || c.totalCount > 0
    );

    // 6. Aggregate Overdue & Loans
    const now = new Date();
    const overdueLoans: OverdueReportRow[] = [];
    const recentLoans: LoanReportRow[] = [];

    if (transactions) {
      for (const t of transactions) {
        // Handle assets joined object (could be array or object from PostgREST)
        const assetObj = Array.isArray(t.assets) ? t.assets[0] : t.assets;
        const assetCode = assetObj?.asset_code || "-";
        const assetName = assetObj?.name || "-";

        const dueDate = t.due_date;
        const isOverdue = !t.returned_at && !!dueDate && new Date(dueDate) < now;
        const overdueDays = isOverdue && dueDate
          ? Math.max(1, Math.floor((now.getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        if (isOverdue && dueDate) {
          overdueLoans.push({
            transactionId: t.id,
            assetCode,
            assetName,
            borrowerName: t.borrower_name,
            borrowerDept: t.borrower_department || "-",
            borrowedAt: t.borrowed_at,
            dueDate,
            overdueDays,
          });
        }

        if (recentLoans.length < 50) {
          recentLoans.push({
            transactionId: t.id,
            assetCode,
            assetName,
            borrowerName: t.borrower_name,
            borrowerDept: t.borrower_department || "-",
            borrowedAt: t.borrowed_at,
            dueDate,
            returnedAt: t.returned_at,
            status: t.status,
            condition: t.condition_on_return,
          });
        }
      }
    }

    return {
      categoriesSummary,
      overdueLoans,
      recentLoans,
      totals: {
        totalCategories: categoriesSummary.length,
        totalAssets,
        totalAvailable,
        totalBorrowed,
        totalMaintenance,
        totalLost,
        totalOverdue: overdueLoans.length,
      },
      generatedBy: {
        name: generatedByName,
        department: generatedByDept,
        email: generatedByEmail,
      },
    };
  } catch (err) {
    console.error("Error in getReportsData:", err);
    return {
      categoriesSummary: [],
      overdueLoans: [],
      recentLoans: [],
      totals: {
        totalCategories: 0,
        totalAssets: 0,
        totalAvailable: 0,
        totalBorrowed: 0,
        totalMaintenance: 0,
        totalLost: 0,
        totalOverdue: 0,
      },
      generatedBy: {
        name: "เจ้าหน้าที่พัสดุ",
        department: "สำนักเทคโนโลยีดิจิทัล",
        email: "",
      },
    };
  }
}
