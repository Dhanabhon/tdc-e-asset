"use client";

import { forwardRef } from "react";
import { formatThaiDate } from "@/lib/utils";
import { ReportsDataResult } from "@/actions/reports";

export interface A4ReportDocumentProps {
  data: ReportsDataResult;
  reportType: "category" | "overdue" | "loans";
  showLogo: boolean;
  showSignatures: boolean;
  showStats: boolean;
  budgetYear: string;
  selectedCategory: string;
}

export const A4ReportDocument = forwardRef<HTMLDivElement, A4ReportDocumentProps>(
  (
    {
      data,
      reportType,
      showLogo,
      showSignatures,
      showStats,
      budgetYear,
      selectedCategory,
    },
    ref
  ) => {
    // Filter categories if selected
    const filteredCategories =
      selectedCategory === "all"
        ? data.categoriesSummary
        : data.categoriesSummary.filter((c) => c.categoryId === selectedCategory);

    // Sum totals of filtered categories
    const filteredTotals = filteredCategories.reduce(
      (acc, c) => ({
        available: acc.available + c.availableCount,
        borrowed: acc.borrowed + c.borrowedCount,
        maintenance: acc.maintenance + c.maintenanceCount,
        lost: acc.lost + c.lostCount,
        total: acc.total + c.totalCount,
        totalQty: acc.totalQty + c.totalQuantity,
      }),
      { available: 0, borrowed: 0, maintenance: 0, lost: 0, total: 0, totalQty: 0 }
    );

    const currentDate = formatThaiDate(new Date().toISOString());

    return (
      <div
        ref={ref}
        id="printable-a4-report"
        className="w-[210mm] min-h-[297mm] bg-white text-[#111827] p-[16mm] mx-auto shadow-2xl relative font-sans text-xs flex flex-col justify-between select-text"
        style={{ boxSizing: "border-box" }}
      >
        <div>
          {/* Official Document Header */}
          <div className="border-b-2 border-[#111827] pb-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {showLogo && (
                  <div className="w-12 h-12 rounded-xl bg-[#211f1c] text-[#faf9f5] flex items-center justify-center font-serif text-2xl font-bold border border-[#211f1c] shrink-0">
                    <span className="text-[#c2593c]">e</span>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-[#4b5563]">
                    ระบบบริหารจัดการครุภัณฑ์และพัสดุภาครัฐ (TDC e-Asset)
                  </div>
                  <h1 className="text-lg font-bold tracking-tight text-[#111827] leading-tight">
                    {reportType === "category" && "รายงานสรุปสถานภาพครุภัณฑ์แยกตามหมวดหมู่"}
                    {reportType === "overdue" && "รายงานรายการครุภัณฑ์ค้างส่งคืน (เกินกำหนด)"}
                    {reportType === "loans" && "รายงานประวัติการยืมและคืนครุภัณฑ์"}
                  </h1>
                  <p className="text-[11px] text-[#4b5563]">
                    สำนักเทคโนโลยีดิจิทัล (TDC) · ประจำปีงบประมาณ พ.ศ. {budgetYear}
                  </p>
                </div>
              </div>

              {/* Document Meta Info Table */}
              <div className="text-right space-y-0.5 text-[10px] text-[#4b5563] shrink-0">
                <div className="font-mono font-semibold text-[#111827] text-xs">
                  เลขที่: REP-{budgetYear}-{(reportType === "category" ? "001" : reportType === "overdue" ? "002" : "003")}
                </div>
                <div>วันที่ออกเอกสาร: {currentDate}</div>
                <div>
                  ผู้จัดทำ: <span className="text-[#111827] font-medium">{data.generatedBy.name}</span>
                </div>
                <div>ฝ่ายงาน: {data.generatedBy.department}</div>
              </div>
            </div>

            {/* Mini Stat Pill Summary */}
            {showStats && reportType === "category" && (
              <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-[#e5e7eb] text-center">
                <div className="p-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                  <div className="text-[10px] text-[#6b7280]">ครุภัณฑ์ทั้งหมด</div>
                  <div className="text-base font-bold text-[#111827] font-serif">
                    {filteredTotals.total.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
                  <div className="text-[10px] text-[#166534]">พร้อมใช้งาน</div>
                  <div className="text-base font-bold text-[#15803d] font-serif">
                    {filteredTotals.available.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#fffbeb] border border-[#fde68a]">
                  <div className="text-[10px] text-[#92400e]">กำลังถูกยืม</div>
                  <div className="text-base font-bold text-[#b45309] font-serif">
                    {filteredTotals.borrowed.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#fef2f2] border border-[#fecaca]">
                  <div className="text-[10px] text-[#991b1b]">ชำรุด / ส่งซ่อม</div>
                  <div className="text-base font-bold text-[#b91c1c] font-serif">
                    {filteredTotals.maintenance.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#f3f4f6] border border-[#d1d5db]">
                  <div className="text-[10px] text-[#374151]">สูญหาย</div>
                  <div className="text-base font-bold text-[#1f2937] font-serif">
                    {filteredTotals.lost.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="space-y-3">
            {reportType === "category" && (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#f3f4f6] border-y border-[#9ca3af] text-[#111827]">
                    <th className="py-2 px-2 text-center font-bold w-10">ลำดับ</th>
                    <th className="py-2 px-2 text-center font-bold w-16">รหัสหมวด</th>
                    <th className="py-2 px-3 text-left font-bold">ชื่อหมวดหมู่ครุภัณฑ์</th>
                    <th className="py-2 px-2 text-center font-bold w-16 text-[#15803d]">พร้อมใช้</th>
                    <th className="py-2 px-2 text-center font-bold w-16 text-[#b45309]">ถูกยืม</th>
                    <th className="py-2 px-2 text-center font-bold w-16 text-[#b91c1c]">ส่งซ่อม</th>
                    <th className="py-2 px-2 text-center font-bold w-16 text-[#1f2937]">สูญหาย</th>
                    <th className="py-2 px-3 text-right font-bold w-20">รวม (รายการ)</th>
                    <th className="py-2 px-3 text-right font-bold w-20">จำนวนชิ้น</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredCategories.map((cat, idx) => (
                    <tr key={cat.categoryId} className="hover:bg-[#fafafa]">
                      <td className="py-2 px-2 text-center text-[#6b7280]">{idx + 1}</td>
                      <td className="py-2 px-2 text-center font-mono font-medium">{cat.prefixCode || "-"}</td>
                      <td className="py-2 px-3 font-medium text-[#111827]">{cat.categoryName}</td>
                      <td className="py-2 px-2 text-center text-[#15803d] font-semibold">{cat.availableCount}</td>
                      <td className="py-2 px-2 text-center text-[#b45309] font-semibold">{cat.borrowedCount}</td>
                      <td className="py-2 px-2 text-center text-[#b91c1c] font-semibold">{cat.maintenanceCount}</td>
                      <td className="py-2 px-2 text-center text-[#1f2937] font-semibold">{cat.lostCount}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#111827]">{cat.totalCount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#4b5563]">{cat.totalQuantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f9fafb] border-t-2 border-b-2 border-[#111827] font-bold text-[#111827]">
                    <td colSpan={3} className="py-2.5 px-3 text-left">รวมทั้งสิ้น ({filteredCategories.length} หมวดหมู่)</td>
                    <td className="py-2.5 px-2 text-center text-[#15803d]">{filteredTotals.available}</td>
                    <td className="py-2.5 px-2 text-center text-[#b45309]">{filteredTotals.borrowed}</td>
                    <td className="py-2.5 px-2 text-center text-[#b91c1c]">{filteredTotals.maintenance}</td>
                    <td className="py-2.5 px-2 text-center text-[#1f2937]">{filteredTotals.lost}</td>
                    <td className="py-2.5 px-3 text-right font-serif text-sm">{filteredTotals.total.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-serif text-sm">{filteredTotals.totalQty.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {reportType === "overdue" && (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#f3f4f6] border-y border-[#9ca3af] text-[#111827]">
                    <th className="py-2 px-2 text-center font-bold w-10">ลำดับ</th>
                    <th className="py-2 px-2 text-left font-bold w-24">รหัสครุภัณฑ์</th>
                    <th className="py-2 px-3 text-left font-bold">ชื่อรายการครุภัณฑ์</th>
                    <th className="py-2 px-3 text-left font-bold">ผู้ยืม / สังกัด</th>
                    <th className="py-2 px-2 text-center font-bold w-20">วันที่ยืม</th>
                    <th className="py-2 px-2 text-center font-bold w-20">กำหนดส่งคืน</th>
                    <th className="py-2 px-2 text-right font-bold w-20 text-[#b91c1c]">เกิน (วัน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {data.overdueLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#6b7280]">
                        ✓ ไม่พบรายการครุภัณฑ์เกินกำหนดส่งคืนในระบบ
                      </td>
                    </tr>
                  ) : (
                    data.overdueLoans.map((row, idx) => (
                      <tr key={row.transactionId} className="hover:bg-[#fafafa]">
                        <td className="py-2 px-2 text-center text-[#6b7280]">{idx + 1}</td>
                        <td className="py-2 px-2 font-mono font-semibold">{row.assetCode}</td>
                        <td className="py-2 px-3 font-medium">{row.assetName}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-[#111827]">{row.borrowerName}</span>
                          <span className="text-[10px] text-[#6b7280]"> ({row.borrowerDept})</span>
                        </td>
                        <td className="py-2 px-2 text-center">{formatThaiDate(row.borrowedAt)}</td>
                        <td className="py-2 px-2 text-center text-[#b91c1c] font-medium">{formatThaiDate(row.dueDate)}</td>
                        <td className="py-2 px-2 text-right font-bold text-[#b91c1c] font-mono">
                          +{row.overdueDays} วัน
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === "loans" && (
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-[#f3f4f6] border-y border-[#9ca3af] text-[#111827]">
                    <th className="py-2 px-1.5 text-center font-bold w-8">ลำดับ</th>
                    <th className="py-2 px-2 text-left font-bold w-24">รหัส</th>
                    <th className="py-2 px-2.5 text-left font-bold">ชื่อครุภัณฑ์</th>
                    <th className="py-2 px-2.5 text-left font-bold">ผู้ยืม</th>
                    <th className="py-2 px-2 text-center font-bold w-18">วันที่ยืม</th>
                    <th className="py-2 px-2 text-center font-bold w-18">กำหนดคืน</th>
                    <th className="py-2 px-2 text-center font-bold w-18">วันที่คืน</th>
                    <th className="py-2 px-2 text-center font-bold w-16">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {data.recentLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#6b7280]">
                        ไม่พบประวัติรายการยืม-คืนในระบบ
                      </td>
                    </tr>
                  ) : (
                    data.recentLoans.map((row, idx) => (
                      <tr key={row.transactionId} className="hover:bg-[#fafafa]">
                        <td className="py-1.5 px-1.5 text-center text-[#6b7280]">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-mono font-medium">{row.assetCode}</td>
                        <td className="py-1.5 px-2.5 font-medium truncate max-w-[140px]">{row.assetName}</td>
                        <td className="py-1.5 px-2.5">{row.borrowerName}</td>
                        <td className="py-1.5 px-2 text-center">{formatThaiDate(row.borrowedAt)}</td>
                        <td className="py-1.5 px-2 text-center">{formatThaiDate(row.dueDate)}</td>
                        <td className="py-1.5 px-2 text-center">
                          {row.returnedAt ? formatThaiDate(row.returnedAt) : "-"}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          {row.returnedAt ? (
                            <span className="text-[#15803d] font-semibold">คืนแล้ว</span>
                          ) : (
                            <span className="text-[#b45309] font-semibold">กำลังยืม</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Official Report Notes */}
            <div className="pt-4 text-[10px] text-[#6b7280] leading-relaxed">
              <p>
                <strong>หมายเหตุ:</strong> ข้อมูลในเอกสารฉบับนี้ดึงจากฐานข้อมูลระบบทะเบียนครุภัณฑ์แบบเรียลไทม์
                ใช้สำหรับตรวจสอบทรัพย์สินและพัสดุราชการ ห้ามแก้ไขหรือดัดแปลงโดยไม่ได้รับอนุญาต
              </p>
            </div>
          </div>
        </div>

        {/* Dual Signatures Section */}
        {showSignatures && (
          <div className="pt-8 mt-6 border-t border-[#d1d5db]">
            <div className="grid grid-cols-2 gap-12 text-center text-[11px] text-[#374151]">
              <div className="space-y-12">
                <p className="font-semibold text-[#111827]">ผู้จัดทำรายงาน</p>
                <div className="space-y-1">
                  <div className="border-b border-[#9ca3af] w-48 mx-auto"></div>
                  <p className="font-medium text-[#111827]">({data.generatedBy.name})</p>
                  <p className="text-[10px] text-[#6b7280]">{data.generatedBy.department}</p>
                  <p className="text-[10px] text-[#6b7280]">วันที่ ..... / ..... / .........</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-semibold text-[#111827]">หัวหน้าเจ้าหน้าที่พัสดุ / ผู้มีอำนาจอนุมัติ</p>
                <div className="space-y-1">
                  <div className="border-b border-[#9ca3af] w-48 mx-auto"></div>
                  <p className="font-medium text-[#111827]">( .................................................... )</p>
                  <p className="text-[10px] text-[#6b7280]">หัวหน้ากลุ่มงานบริหารสินทรัพย์และพัสดุ</p>
                  <p className="text-[10px] text-[#6b7280]">วันที่ ..... / ..... / .........</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

A4ReportDocument.displayName = "A4ReportDocument";
