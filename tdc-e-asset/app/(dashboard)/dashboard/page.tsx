import Link from "next/link";
import { Plus, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/actions/dashboard";
import { getThaiBuddhistDateHeader } from "@/lib/utils";
import { OverdueBanner } from "@/components/dashboard/OverdueBanner";
import { StatCards } from "@/components/dashboard/StatCards";
import { MonthlyActivity } from "@/components/dashboard/MonthlyActivity";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { OverdueWatchlist } from "@/components/dashboard/OverdueWatchlist";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const currentDateHeader = getThaiBuddhistDateHeader(new Date());

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
            แดชบอร์ด
          </h1>
          <p className="text-xs text-[#8b8271] mt-0.5 font-medium">
            {currentDateHeader}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assets/new">
            <Button
              variant="outline"
              className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold text-[#211f1c] shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่มครุภัณฑ์
            </Button>
          </Link>
          <Link href="/borrow-return">
            <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold shadow-xs cursor-pointer">
              <ArrowLeftRight className="w-4 h-4 mr-1.5" /> บันทึกการยืม
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner (Shown only if overdueCount > 0) */}
      <OverdueBanner count={stats.overdueCount} />

      {/* 4 KPI Summary Cards */}
      <StatCards stats={stats} />

      {/* Middle Section: Monthly Borrow-Return Activity & Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyActivity activity={stats.monthlyActivity} />
        <CategoryBreakdown
          categories={stats.categoryBreakdown}
          totalAssets={stats.totalAssets}
        />
      </div>

      {/* Overdue Watchlist Table (if there are overdue items) */}
      {stats.overdueItems.length > 0 && (
        <OverdueWatchlist
          items={stats.overdueItems}
          totalOverdueCount={stats.overdueCount}
        />
      )}

      {/* Recent 10 Transactions Table */}
      <RecentTransactionsTable transactions={stats.recentTransactions} />
    </div>
  );
}
