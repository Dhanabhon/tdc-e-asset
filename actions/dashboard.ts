"use server";

import { createClient } from "@/lib/supabase/server";
import {
  AssetStatus,
  ReturnCondition,
  TransactionType,
} from "@/lib/types/database.types";
import { formatThaiDateLong, THAI_SHORT_MONTHS } from "@/lib/utils";

export interface OverdueItem {
  id: string;
  asset_id: string;
  code: string;
  name: string;
  brand_model: string | null;
  who: string;
  borrower_name: string;
  borrower_department: string | null;
  due: string;
  due_date: string;
  late: string;
  overdue_days: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  prefix_code: string | null;
  count: number;
  pct: string;
  percentage: number;
  color: string;
}

export interface MonthlyActivityData {
  month: string;
  monthYear: string;
  borrowCount: number;
  returnCount: number;
  borrowPct: string;
  returnPct: string;
}

export interface RecentTransactionItem {
  id: string;
  asset_id: string;
  borrower_name: string;
  borrower_department: string | null;
  type: TransactionType;
  borrowed_at: string;
  due_date: string | null;
  returned_at: string | null;
  status: string;
  notes: string | null;
  condition_on_return: ReturnCondition | null;
  created_by: string | null;
  creator_name: string | null;
  assets: {
    id: string;
    asset_code: string;
    name: string;
    brand_model: string | null;
    image_url: string | null;
    status: AssetStatus;
  } | null;
  is_overdue: boolean;
  overdue_days: number;
}

export interface DashboardStats {
  totalAssets: number;
  totalQuantity: number;
  availableCount: number;
  availableQuantity: number;
  borrowedCount: number;
  maintenanceCount: number;
  overdueCount: number;
  overdueItems: OverdueItem[];
  categoryBreakdown: CategoryStat[];
  recentTransactions: RecentTransactionItem[];
  monthlyActivity: MonthlyActivityData[];
}

const CATEGORY_THEME_COLORS: Record<string, string> = {
  "ครุภัณฑ์คอมพิวเตอร์": "#c2593c", // Terracotta
  "ครุภัณฑ์สำนักงาน": "#211f1c", // Dark Ink
  "ครุภัณฑ์ไฟฟ้าและวิทยุ": "#5d7d54", // Forest Green
  "ครุภัณฑ์โฆษณาและเผยแพร่": "#b08d3e", // Amber
  "ครุภัณฑ์งานบ้านงานครัว": "#8b8271", // Warm Gray
  "ครุภัณฑ์ยานพาหนะและขนส่ง": "#3e6b89", // Steel Blue
  "ครุภัณฑ์การเกษตร": "#4a6842", // Moss Green
  "ครุภัณฑ์วิทยาศาสตร์และการแพทย์": "#8a4f7d", // Plum
};

const DEFAULT_COLORS = [
  "#c2593c",
  "#211f1c",
  "#5d7d54",
  "#b08d3e",
  "#8b8271",
  "#3e6b89",
  "#8a4f7d",
  "#9c6644",
];

interface RawTransactionQuery {
  id: string;
  asset_id: string;
  borrower_name: string;
  borrower_department: string | null;
  type: TransactionType;
  borrowed_at: string;
  due_date: string | null;
  returned_at: string | null;
  status: string;
  notes: string | null;
  condition_on_return: ReturnCondition | null;
  created_by: string | null;
  created_at: string;
  assets?: {
    id: string;
    asset_code: string;
    name: string;
    brand_model: string | null;
    image_url: string | null;
    status: AssetStatus;
  } | {
    id: string;
    asset_code: string;
    name: string;
    brand_model: string | null;
    image_url: string | null;
    status: AssetStatus;
  }[] | null;
  profiles?: {
    full_name: string | null;
  } | {
    full_name: string | null;
  }[] | null;
}

/**
 * Server action to fetch real-time dashboard statistics and metrics from Supabase.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = await createClient();
    const now = new Date();

    // 1. Query Assets table for KPI totals and category aggregation
    const { data: assetsData, error: assetsError } = await supabase
      .from("assets")
      .select("id, quantity, available_quantity, status, category_id");

    if (assetsError) {
      console.error("Error fetching assets for dashboard:", assetsError);
    }

    const assets = assetsData || [];
    const totalAssets = assets.length;
    const totalQuantity = assets.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const availableCount = assets.filter((a) => a.status === "available").length;
    const availableQuantity = assets.reduce((acc, curr) => acc + (curr.available_quantity || 0), 0);
    const maintenanceCount = assets.filter((a) => a.status === "maintenance").length;

    // 2. Query Categories for Category Breakdown
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, prefix_code")
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Error fetching categories for dashboard:", categoriesError);
    }

    const categories = categoriesData || [];

    // Aggregate asset counts per category
    const categoryCountMap = new Map<string, number>();
    for (const asset of assets) {
      if (asset.category_id) {
        categoryCountMap.set(
          asset.category_id,
          (categoryCountMap.get(asset.category_id) || 0) + 1
        );
      }
    }

    const categoryBreakdown: CategoryStat[] = categories
      .map((cat, index) => {
        const count = categoryCountMap.get(cat.id) || 0;
        const percentage = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
        const color =
          CATEGORY_THEME_COLORS[cat.name] ||
          DEFAULT_COLORS[index % DEFAULT_COLORS.length];

        return {
          id: cat.id,
          name: cat.name,
          prefix_code: cat.prefix_code,
          count,
          pct: `${percentage}%`,
          percentage,
          color,
        };
      })
      .sort((a, b) => b.count - a.count);

    // 3. Query Active Borrow Transactions & Overdue Items
    const { data: activeBorrowsData, error: activeBorrowsError } = await supabase
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
      .eq("type", "borrow" as TransactionType)
      .is("returned_at", null)
      .order("due_date", { ascending: true });

    if (activeBorrowsError) {
      console.error("Error fetching active borrows for dashboard:", activeBorrowsError);
    }

    const rawActiveBorrows = (activeBorrowsData as unknown as RawTransactionQuery[]) || [];
    const borrowedCount = rawActiveBorrows.length;

    // Filter and compute overdue items
    const overdueList: OverdueItem[] = [];

    for (const item of rawActiveBorrows) {
      if (item.due_date) {
        const dueDate = new Date(item.due_date);
        if (dueDate.getTime() < now.getTime()) {
          const diffMs = now.getTime() - dueDate.getTime();
          const overdue_days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          const asset = Array.isArray(item.assets) ? item.assets[0] : item.assets;

          overdueList.push({
            id: item.id,
            asset_id: item.asset_id,
            code: asset?.asset_code || "-",
            name: asset?.name || "ไม่ระบุชื่อครุภัณฑ์",
            brand_model: asset?.brand_model || null,
            who: item.borrower_department
              ? `${item.borrower_name} (${item.borrower_department})`
              : item.borrower_name,
            borrower_name: item.borrower_name,
            borrower_department: item.borrower_department,
            due: formatThaiDateLong(item.due_date),
            due_date: item.due_date,
            late: `เกิน ${overdue_days} วัน`,
            overdue_days,
          });
        }
      }
    }

    // Sort overdue by days late descending
    overdueList.sort((a, b) => b.overdue_days - a.overdue_days);
    const overdueCount = overdueList.length;

    // 4. Query 10 Recent Transactions (joined with assets and profiles:created_by)
    const { data: recentData, error: recentError } = await supabase
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
        ),
        profiles:created_by (
          full_name
        )
      `
      )
      .order("borrowed_at", { ascending: false })
      .limit(10);

    if (recentError) {
      console.error("Error fetching recent transactions:", recentError);
    }

    const rawRecent = (recentData as unknown as RawTransactionQuery[]) || [];
    const recentTransactions: RecentTransactionItem[] = rawRecent.map((item) => {
      const asset = Array.isArray(item.assets) ? item.assets[0] : item.assets;
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;

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
        id: item.id,
        asset_id: item.asset_id,
        borrower_name: item.borrower_name,
        borrower_department: item.borrower_department,
        type: item.type,
        borrowed_at: item.borrowed_at,
        due_date: item.due_date,
        returned_at: item.returned_at,
        status: item.status,
        notes: item.notes,
        condition_on_return: item.condition_on_return,
        created_by: item.created_by,
        creator_name: profile?.full_name || null,
        assets: asset ?? null,
        is_overdue,
        overdue_days,
      };
    });

    // 5. Query 6 Months Activity for Chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data: activityData, error: activityError } = await supabase
      .from("transactions")
      .select("type, borrowed_at, returned_at")
      .gte("borrowed_at", sixMonthsAgo.toISOString());

    if (activityError) {
      console.error("Error fetching monthly activity:", activityError);
    }

    const allTx = activityData || [];

    // Build the 6 months window array
    const monthlyActivity: MonthlyActivityData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth();
      const year = d.getFullYear();
      const thaiYearShort = (year + 543).toString().slice(-2);
      const monthLabel = THAI_SHORT_MONTHS[mIdx];
      const monthYear = `${monthLabel} ${thaiYearShort}`;

      // Count borrows in this month
      const borrowCount = allTx.filter((t) => {
        if (!t.borrowed_at) return false;
        const bt = new Date(t.borrowed_at);
        return bt.getMonth() === mIdx && bt.getFullYear() === year;
      }).length;

      // Count returns in this month
      const returnCount = allTx.filter((t) => {
        if (!t.returned_at) return false;
        const rt = new Date(t.returned_at);
        return rt.getMonth() === mIdx && rt.getFullYear() === year;
      }).length;

      monthlyActivity.push({
        month: monthLabel,
        monthYear,
        borrowCount,
        returnCount,
        borrowPct: "0%",
        returnPct: "0%",
      });
    }

    // Scale percentage heights for bar chart visualization
    const maxVal = Math.max(
      ...monthlyActivity.map((m) => Math.max(m.borrowCount, m.returnCount)),
      1
    );

    for (const item of monthlyActivity) {
      const bPct = item.borrowCount > 0 ? Math.max(12, Math.round((item.borrowCount / maxVal) * 88)) : 6;
      const rPct = item.returnCount > 0 ? Math.max(12, Math.round((item.returnCount / maxVal) * 88)) : 6;
      item.borrowPct = `${bPct}%`;
      item.returnPct = `${rPct}%`;
    }

    return {
      totalAssets,
      totalQuantity,
      availableCount,
      availableQuantity,
      borrowedCount,
      maintenanceCount,
      overdueCount,
      overdueItems: overdueList,
      categoryBreakdown,
      recentTransactions,
      monthlyActivity,
    };
  } catch (err) {
    console.error("Unexpected error in getDashboardStats:", err);
    return {
      totalAssets: 0,
      totalQuantity: 0,
      availableCount: 0,
      availableQuantity: 0,
      borrowedCount: 0,
      maintenanceCount: 0,
      overdueCount: 0,
      overdueItems: [],
      categoryBreakdown: [],
      recentTransactions: [],
      monthlyActivity: [],
    };
  }
}
