"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  RotateCcw,
  ExternalLink,
  Package,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnDialog } from "@/components/borrow-return/ReturnDialog";
import { RecentTransactionItem } from "@/actions/dashboard";
import { LoanWithAsset } from "@/actions/transactions";
import { formatThaiDate, formatThaiDateLong } from "@/lib/utils";

interface RecentTransactionsTableProps {
  transactions: RecentTransactionItem[];
}

export function RecentTransactionsTable({
  transactions,
}: RecentTransactionsTableProps) {
  const router = useRouter();
  const [selectedTx, setSelectedTx] = useState<RecentTransactionItem | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const handleOpenReturn = (tx: RecentTransactionItem) => {
    setSelectedTx(tx);
    setIsReturnDialogOpen(true);
  };

  const handleReturnSuccess = () => {
    setIsReturnDialogOpen(false);
    setSelectedTx(null);
    router.refresh();
  };

  return (
    <>
      <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[#211f1c]">
              รายการยืม–คืนล่าสุด
            </CardTitle>
            <p className="text-[11px] text-[#8b8271] mt-0.5">
              แสดง 10 ธุรกรรมล่าสุดที่มีการบันทึกในระบบ
            </p>
          </div>
          <Link
            href="/borrow-return"
            className="text-xs font-semibold text-[#c2593c] hover:underline flex items-center gap-1"
          >
            ดูประวัติทั้งหมด <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b8271]">
              <Package className="w-8 h-8 mx-auto text-[#b08d3e] mb-2 opacity-50" />
              <p>ยังไม่มีประวัติการทำรายการยืม-คืนในระบบ</p>
              <Link href="/borrow-return" className="mt-2 inline-block">
                <Button size="xs" className="mt-2 bg-[#c2593c] text-white text-xs">
                  บันทึกการยืมแรก
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-t border-[#e7e2d4]">
                <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                  <tr>
                    <th className="px-4 py-2.5">รหัสครุภัณฑ์ / รายการ</th>
                    <th className="px-4 py-2.5">ผู้ยืม / หน่วยงาน</th>
                    <th className="px-4 py-2.5">วันที่ยืม</th>
                    <th className="px-4 py-2.5">กำหนดคืน / วันที่คืน</th>
                    <th className="px-4 py-2.5">สถานะ</th>
                    <th className="px-4 py-2.5 text-right">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efeadd]">
                  {transactions.map((tx) => {
                    const isReturned = !!tx.returned_at;
                    const isOverdue = tx.is_overdue;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-[#f5f2ea] transition-colors"
                      >
                        {/* 1. รหัสและชื่อครุภัณฑ์ */}
                        <td className="px-4 py-3">
                          <div className="font-mono text-[11px] font-semibold text-[#4a453d]">
                            {tx.assets?.asset_code || "-"}
                          </div>
                          <div className="font-medium text-[#211f1c] truncate max-w-[220px]">
                            {tx.assets?.name || "ไม่ระบุชื่อครุภัณฑ์"}
                          </div>
                          {tx.assets?.brand_model && (
                            <div className="text-[10px] text-[#8b8271] truncate max-w-[200px]">
                              {tx.assets.brand_model}
                            </div>
                          )}
                        </td>

                        {/* 2. ผู้ยืมและแผนก */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#211f1c] flex items-center gap-1.5">
                            <User className="w-3 h-3 text-[#71695e]" />
                            <span>{tx.borrower_name}</span>
                          </div>
                          {tx.borrower_department && (
                            <div className="text-[11px] text-[#8b8271] pl-4">
                              {tx.borrower_department}
                            </div>
                          )}
                        </td>

                        {/* 3. วันที่ยืม */}
                        <td className="px-4 py-3 text-[#71695e] whitespace-nowrap">
                          {formatThaiDateLong(tx.borrowed_at)}
                        </td>

                        {/* 4. กำหนดคืน / วันที่คืน */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isReturned ? (
                            <div className="text-[#5d7d54]">
                              <span className="font-medium">คืนเมื่อ:</span>{" "}
                              {formatThaiDate(tx.returned_at)}
                            </div>
                          ) : (
                            <div>
                              <div className="text-[#71695e]">
                                {formatThaiDateLong(tx.due_date)}
                              </div>
                              {isOverdue && (
                                <div className="text-[10px] font-bold text-[#b3401f] mt-0.5">
                                  เกิน {tx.overdue_days} วัน
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 5. สถานะ */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isReturned ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e2ebd8] text-[#43633a]">
                              ✓ คืนแล้ว
                              {tx.condition_on_return === "damaged_repair"
                                ? " (ชำรุดส่งซ่อม)"
                                : tx.condition_on_return === "damaged_minor"
                                ? " (ชำรุดเล็กน้อย)"
                                : ""}
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7e5df] text-[#b3401f]">
                              เกินกำหนดคืน
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eae7dc] text-[#211f1c]">
                              กำลังยืม
                            </span>
                          )}
                        </td>

                        {/* 6. การกระทำ */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isReturned && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleOpenReturn(tx)}
                                className="border-[#5d7d54] text-[#4a6842] hover:bg-[#5d7d54] hover:text-white text-[11px] font-semibold h-7 px-2.5 cursor-pointer shadow-2xs"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" /> รับคืน
                              </Button>
                            )}

                            {tx.asset_id && (
                              <Link href={`/assets/${tx.asset_id}`}>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="text-[#71695e] hover:text-[#211f1c] hover:bg-[#eae7dc] text-[11px] h-7 px-2"
                                  title="ดูรายละเอียดครุภัณฑ์"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="sr-only sm:not-sr-only sm:ml-1">ดู</span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Modal Dialog */}
      {selectedTx && (
        <ReturnDialog
          open={isReturnDialogOpen}
          onOpenChange={(open) => {
            setIsReturnDialogOpen(open);
            if (!open) setSelectedTx(null);
          }}
          loan={selectedTx as unknown as LoanWithAsset}
          onSuccess={handleReturnSuccess}
        />
      )}
    </>
  );
}
