import { Suspense } from "react";
import { getAvailableAssetsForBorrow, getActiveLoans } from "@/actions/transactions";
import { BorrowReturnClient } from "@/components/borrow-return/BorrowReturnClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface BorrowReturnPageProps {
  searchParams: Promise<{
    asset_id?: string;
    filter?: string;
    search?: string;
  }>;
}

export default async function BorrowReturnPage({ searchParams }: BorrowReturnPageProps) {
  const resolvedParams = await searchParams;
  const defaultAssetId = resolvedParams.asset_id || "";
  const filterParam = resolvedParams.filter;
  const defaultFilter =
    filterParam === "overdue" || filterParam === "returned" || filterParam === "active"
      ? filterParam
      : "active";

  const [availableAssets, initialLoans] = await Promise.all([
    getAvailableAssetsForBorrow(),
    getActiveLoans({ filter: "all" }),
  ]);

  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-[#8b8271]">
          <Loader2 className="w-6 h-6 animate-spin text-[#c2593c]" />
          <p className="text-xs">กำลังโหลดข้อมูลระบบยืม–คืนครุภัณฑ์...</p>
        </div>
      }
    >
      <BorrowReturnClient
        availableAssets={availableAssets}
        initialLoans={initialLoans}
        defaultAssetId={defaultAssetId}
        defaultFilter={defaultFilter}
      />
    </Suspense>
  );
}
