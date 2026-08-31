"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverdueItem } from "@/actions/dashboard";
import { ReturnDialog } from "@/components/borrow-return/ReturnDialog";
import { LoanWithAsset } from "@/actions/transactions";

interface OverdueWatchlistProps {
  items: OverdueItem[];
  totalOverdueCount: number;
}

export function OverdueWatchlist({
  items,
  totalOverdueCount,
}: OverdueWatchlistProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<OverdueItem | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const handleOpenReturn = (item: OverdueItem) => {
    setSelectedItem(item);
    setIsReturnDialogOpen(true);
  };

  const handleReturnSuccess = () => {
    setIsReturnDialogOpen(false);
    setSelectedItem(null);
    router.refresh();
  };

  // Convert OverdueItem to LoanWithAsset format for ReturnDialog
  const loanPayload: LoanWithAsset | null = selectedItem
    ? ({
        id: selectedItem.id,
        asset_id: selectedItem.asset_id,
        borrower_name: selectedItem.borrower_name,
        borrower_department: selectedItem.borrower_department,
        type: "borrow",
        borrowed_at: selectedItem.due_date,
        due_date: selectedItem.due_date,
        returned_at: null,
        status: "active",
        notes: null,
        condition_on_return: null,
        created_by: null,
        created_at: selectedItem.due_date,
        assets: {
          id: selectedItem.asset_id,
          asset_code: selectedItem.code,
          name: selectedItem.name,
          brand_model: selectedItem.brand_model,
          image_url: null,
          status: "borrowed",
        },
        is_overdue: true,
        overdue_days: selectedItem.overdue_days,
      } as unknown as LoanWithAsset)
    : null;

  return (
    <>
      <Card className="bg-[#faf9f5] border-[#e5b8a8] shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#b3401f]" />
            <CardTitle className="text-sm font-semibold text-[#b3401f]">
              เกินกำหนดคืน — ต้องติดตาม
            </CardTitle>
          </div>
          <Link
            href="/borrow-return?filter=overdue"
            className="text-xs font-semibold text-[#c2593c] hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด ({totalOverdueCount}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t border-[#e7e2d4]">
              <thead className="bg-[#fcf4f1] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                <tr>
                  <th className="px-4 py-2.5">รหัสครุภัณฑ์</th>
                  <th className="px-4 py-2.5">รายการ</th>
                  <th className="px-4 py-2.5">ผู้ยืม</th>
                  <th className="px-4 py-2.5">กำหนดคืน</th>
                  <th className="px-4 py-2.5">ระยะเวลาเกิน</th>
                  <th className="px-4 py-2.5 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeadd]">
                {items.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#fcf4f1]/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-[#4a453d] whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#211f1c]">
                      {item.name}
                      {item.brand_model && (
                        <span className="block text-[11px] font-normal text-[#8b8271]">
                          {item.brand_model}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#71695e]">
                      {item.who}
                    </td>
                    <td className="px-4 py-3 text-[#8b8271] whitespace-nowrap">
                      {item.due}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#b3401f] whitespace-nowrap">
                      {item.late}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleOpenReturn(item)}
                          className="border-[#5d7d54] text-[#4a6842] hover:bg-[#5d7d54] hover:text-white text-[11px] font-semibold h-7 px-2.5 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> รับคืน
                        </Button>
                        <Link href={`/assets/${item.asset_id}`}>
                          <Button
                            size="xs"
                            variant="outline"
                            className="border-[#d8d2c2] text-xs text-[#71695e] hover:border-[#c2593c] hover:text-[#c2593c] h-7"
                          >
                            ติดตาม
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Return Modal Dialog */}
      {loanPayload && (
        <ReturnDialog
          open={isReturnDialogOpen}
          onOpenChange={(open) => {
            setIsReturnDialogOpen(open);
            if (!open) setSelectedItem(null);
          }}
          loan={loanPayload}
          onSuccess={handleReturnSuccess}
        />
      )}
    </>
  );
}
