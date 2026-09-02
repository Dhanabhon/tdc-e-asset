"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Layers,
  ArrowLeftRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsDataResult } from "@/actions/reports";
import { PdfPreviewModal } from "./PdfPreviewModal";
import { formatThaiDate } from "@/lib/utils";

interface ReportsClientProps {
  data: ReportsDataResult;
}

export function ReportsClient({ data }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<"category" | "loans" | "overdue">("category");
  const [budgetYear, setBudgetYear] = useState("2569");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // CSV Export
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Excel Thai language support

    if (activeTab === "category") {
      csvContent += "ลำดับ,รหัสหมวด,ชื่อหมวดหมู่,พร้อมใช้งาน,กำลังถูกยืม,ส่งซ่อม,สูญหาย,รวมรายการ,จำนวนชิ้นรวม\n";
      data.categoriesSummary.forEach((cat, idx) => {
        csvContent += `"${idx + 1}","${cat.prefixCode || "-"}","${cat.categoryName}",${cat.availableCount},${cat.borrowedCount},${cat.maintenanceCount},${cat.lostCount},${cat.totalCount},${cat.totalQuantity}\n`;
      });
      csvContent += `"",,"รวมทั้งสิ้น",${data.totals.totalAvailable},${data.totals.totalBorrowed},${data.totals.totalMaintenance},${data.totals.totalLost},${data.totals.totalAssets},\n`;
    } else if (activeTab === "overdue") {
      csvContent += "ลำดับ,รหัสครุภัณฑ์,ชื่อรายการ,ผู้ยืม,สังกัด,วันที่ยืม,กำหนดส่งคืน,เกินกำหนด(วัน)\n";
      data.overdueLoans.forEach((row, idx) => {
        csvContent += `"${idx + 1}","${row.assetCode}","${row.assetName}","${row.borrowerName}","${row.borrowerDept}","${formatThaiDate(row.borrowedAt)}","${formatThaiDate(row.dueDate)}",${row.overdueDays}\n`;
      });
    } else {
      csvContent += "ลำดับ,รหัสครุภัณฑ์,ชื่อรายการ,ผู้ยืม,สังกัด,วันที่ยืม,กำหนดส่งคืน,วันที่คืน,สถานะ\n";
      data.recentLoans.forEach((row, idx) => {
        csvContent += `"${idx + 1}","${row.assetCode}","${row.assetName}","${row.borrowerName}","${row.borrowerDept}","${formatThaiDate(row.borrowedAt)}","${formatThaiDate(row.dueDate)}","${row.returnedAt ? formatThaiDate(row.returnedAt) : "-"}","${row.returnedAt ? "คืนแล้ว" : "กำลังยืม"}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${activeTab}_${budgetYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eae7dc] border border-[#ddd6c6] text-[11px] font-medium text-[#71695e] mb-2">
            <FileText className="w-3 h-3 text-[#c2593c]" />
            <span>ระบบเอกสารและรายงานราชการ</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">รายงาน (Reports)</h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            รายงานสรุปครุภัณฑ์ การยืม–คืน และตรวจสอบสถานภาพทรัพย์สินภาครัฐ
          </p>
        </div>

        <Button
          onClick={() => setIsPreviewOpen(true)}
          className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>ดูตัวอย่างและพิมพ์รายงาน PDF (A4)</span>
        </Button>
      </div>

      {/* 3 Report Selector Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Category Summary */}
        <Card
          onClick={() => setActiveTab("category")}
          className={`cursor-pointer transition-all duration-150 p-4 border ${
            activeTab === "category"
              ? "bg-[#211f1c] text-[#faf9f5] border-[#211f1c] shadow-md ring-1 ring-[#211f1c]/20"
              : "bg-[#faf9f5] border-[#e3ddcd] hover:border-[#c2593c] text-[#211f1c]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-xl ${activeTab === "category" ? "bg-[#383431] text-[#c2593c]" : "bg-[#f5f0e6] text-[#c2593c]"}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-mono ${activeTab === "category" ? "text-[#c7c5be]" : "text-[#8b8271]"}`}>
              {data.categoriesSummary.length} หมวด
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold leading-tight">สรุปครุภัณฑ์ตามหมวด/สถานะ</h3>
            <p className={`text-[11px] mt-1 ${activeTab === "category" ? "text-[#c7c5be]" : "text-[#71695e]"}`}>
              จำแนกพร้อมใช้, ถูกยืม, ส่งซ่อม, สูญหาย
            </p>
          </div>
        </Card>

        {/* Card 2: Overdue Loans */}
        <Card
          onClick={() => setActiveTab("overdue")}
          className={`cursor-pointer transition-all duration-150 p-4 border ${
            activeTab === "overdue"
              ? "bg-[#211f1c] text-[#faf9f5] border-[#211f1c] shadow-md ring-1 ring-[#211f1c]/20"
              : "bg-[#faf9f5] border-[#e3ddcd] hover:border-[#b3401f] text-[#211f1c]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-xl ${activeTab === "overdue" ? "bg-[#383431] text-[#f87171]" : "bg-[#fef2f2] text-[#b3401f]"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              data.totals.totalOverdue > 0
                ? "bg-[#fef2f2] text-[#b3401f]"
                : "bg-[#f0fdf4] text-[#15803d]"
            }`}>
              {data.totals.totalOverdue} รายการ
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold leading-tight">ครุภัณฑ์เกินกำหนดคืน</h3>
            <p className={`text-[11px] mt-1 ${activeTab === "overdue" ? "text-[#c7c5be]" : "text-[#71695e]"}`}>
              ติดตามผู้ยืมและวันที่ค้างส่งคืน
            </p>
          </div>
        </Card>

        {/* Card 3: Recent Loans */}
        <Card
          onClick={() => setActiveTab("loans")}
          className={`cursor-pointer transition-all duration-150 p-4 border ${
            activeTab === "loans"
              ? "bg-[#211f1c] text-[#faf9f5] border-[#211f1c] shadow-md ring-1 ring-[#211f1c]/20"
              : "bg-[#faf9f5] border-[#e3ddcd] hover:border-[#c2593c] text-[#211f1c]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-xl ${activeTab === "loans" ? "bg-[#383431] text-[#c2593c]" : "bg-[#f5f2ea] text-[#71695e]"}`}>
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-mono ${activeTab === "loans" ? "text-[#c7c5be]" : "text-[#8b8271]"}`}>
              ประวัติล่าสุด
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold leading-tight">ประวัติการยืม-คืน</h3>
            <p className={`text-[11px] mt-1 ${activeTab === "loans" ? "text-[#c7c5be]" : "text-[#71695e]"}`}>
              บันทึกการส่งคืนและประเมินสภาพ
            </p>
          </div>
        </Card>
      </div>

      {/* Main Table Output Card */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden shadow-2xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e7e2d4] gap-4 bg-[#faf9f5]">
          <div>
            <CardTitle className="text-sm font-bold text-[#211f1c] flex items-center gap-2">
              <span>
                {activeTab === "category" && "สรุปครุภัณฑ์ตามหมวดและสถานะ"}
                {activeTab === "overdue" && "รายการครุภัณฑ์เกินกำหนดคืน"}
                {activeTab === "loans" && "ประวัติการยืม-คืนพัสดุ"}
              </span>
              <span className="text-xs font-normal text-[#8b8271]">
                · ปีงบประมาณ พ.ศ. {budgetYear}
              </span>
            </CardTitle>
            <p className="text-[11px] text-[#8b8271] mt-0.5">
              สร้างรายงานโดย: {data.generatedBy.name} ({data.generatedBy.department})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={budgetYear}
              onChange={(e) => setBudgetYear(e.target.value)}
              className="h-9 px-3 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] cursor-pointer"
            >
              <option value="2569">ปีงบประมาณ 2569</option>
              <option value="2568">ปีงบประมาณ 2568</option>
            </select>

            <Button
              variant="outline"
              size="xs"
              onClick={handleExportCSV}
              className="h-9 border-[#d8d2c2] bg-white text-xs hover:bg-[#f5f2ea] text-[#4a453d] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#5d7d54]" /> Excel (CSV)
            </Button>

            <Button
              size="xs"
              onClick={() => setIsPreviewOpen(true)}
              className="h-9 bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> A4 PDF Preview
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {activeTab === "category" && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5f2ea] text-[#71695e] font-semibold border-b border-[#e7e2d4]">
                  <tr>
                    <th className="px-5 py-3 font-medium">รหัสหมวด</th>
                    <th className="px-5 py-3 font-medium">หมวดหมู่ครุภัณฑ์</th>
                    <th className="px-4 py-3 text-center font-medium text-[#43633a]">พร้อมใช้งาน</th>
                    <th className="px-4 py-3 text-center font-medium text-[#8c6d23]">กำลังถูกยืม</th>
                    <th className="px-4 py-3 text-center font-medium text-[#b3401f]">ส่งซ่อม</th>
                    <th className="px-4 py-3 text-center font-medium text-[#211f1c]">สูญหาย</th>
                    <th className="px-5 py-3 text-right font-medium">รวม (รายการ)</th>
                    <th className="px-5 py-3 text-right font-medium">จำนวนชิ้นรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efeadd]">
                  {data.categoriesSummary.map((row) => (
                    <tr key={row.categoryId} className="hover:bg-[#f5f2ea] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[#71695e] font-medium">
                        {row.prefixCode || "-"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#211f1c]">
                        {row.categoryName}
                      </td>
                      <td className="px-4 py-3.5 text-center text-[#43633a] font-medium">
                        {row.availableCount}
                      </td>
                      <td className="px-4 py-3.5 text-center text-[#8c6d23] font-medium">
                        {row.borrowedCount}
                      </td>
                      <td className="px-4 py-3.5 text-center text-[#b3401f] font-medium">
                        {row.maintenanceCount}
                      </td>
                      <td className="px-4 py-3.5 text-center text-[#211f1c] font-medium">
                        {row.lostCount}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#211f1c]">
                        {row.totalCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-medium text-[#4a453d]">
                        {row.totalQuantity.toLocaleString()} ชิ้น
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#f0ece0] font-semibold text-[#211f1c] border-t-2 border-[#ddd6c6]">
                  <tr>
                    <td colSpan={2} className="px-5 py-3.5 font-bold">
                      รวมทั้งหมด ({data.categoriesSummary.length} หมวด)
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#43633a] font-bold">
                      {data.totals.totalAvailable}
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#8c6d23] font-bold">
                      {data.totals.totalBorrowed}
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#b3401f] font-bold">
                      {data.totals.totalMaintenance}
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#211f1c] font-bold">
                      {data.totals.totalLost}
                    </td>
                    <td className="px-5 py-3.5 text-right font-serif font-bold text-sm">
                      {data.totals.totalAssets.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-sm">
                      {data.categoriesSummary.reduce((s, c) => s + c.totalQuantity, 0).toLocaleString()} ชิ้น
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {activeTab === "overdue" && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5f2ea] text-[#71695e] font-semibold border-b border-[#e7e2d4]">
                  <tr>
                    <th className="px-5 py-3 font-medium">รหัสครุภัณฑ์</th>
                    <th className="px-5 py-3 font-medium">ชื่อรายการ</th>
                    <th className="px-5 py-3 font-medium">ผู้ยืม / หน่วยงาน</th>
                    <th className="px-4 py-3 text-center font-medium">วันที่ยืม</th>
                    <th className="px-4 py-3 text-center font-medium">กำหนดส่งคืน</th>
                    <th className="px-5 py-3 text-right font-medium text-[#b3401f]">เกินกำหนด (วัน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efeadd]">
                  {data.overdueLoans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#8b8271]">
                        ✓ ไม่พบรายการครุภัณฑ์ที่เกินกำหนดส่งคืนในระบบ
                      </td>
                    </tr>
                  ) : (
                    data.overdueLoans.map((row) => (
                      <tr key={row.transactionId} className="hover:bg-[#f5f2ea] transition-colors">
                        <td className="px-5 py-3.5 font-mono font-medium text-[#211f1c]">
                          {row.assetCode}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#211f1c]">
                          {row.assetName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-[#211f1c]">{row.borrowerName}</span>
                          <span className="text-[#8b8271]"> ({row.borrowerDept})</span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#71695e]">
                          {formatThaiDate(row.borrowedAt)}
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#b3401f] font-medium">
                          {formatThaiDate(row.dueDate)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-[#b3401f]">
                          +{row.overdueDays} วัน
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "loans" && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5f2ea] text-[#71695e] font-semibold border-b border-[#e7e2d4]">
                  <tr>
                    <th className="px-5 py-3 font-medium">รหัสครุภัณฑ์</th>
                    <th className="px-5 py-3 font-medium">ชื่อรายการ</th>
                    <th className="px-5 py-3 font-medium">ผู้ยืม</th>
                    <th className="px-4 py-3 text-center font-medium">วันที่ยืม</th>
                    <th className="px-4 py-3 text-center font-medium">กำหนดส่งคืน</th>
                    <th className="px-4 py-3 text-center font-medium">วันที่ส่งคืนจริง</th>
                    <th className="px-4 py-3 text-center font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efeadd]">
                  {data.recentLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8b8271]">
                        ไม่พบประวัติรายการยืม-คืนในระบบ
                      </td>
                    </tr>
                  ) : (
                    data.recentLoans.map((row) => (
                      <tr key={row.transactionId} className="hover:bg-[#f5f2ea] transition-colors">
                        <td className="px-5 py-3.5 font-mono font-medium text-[#211f1c]">
                          {row.assetCode}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#211f1c]">
                          {row.assetName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-[#211f1c]">{row.borrowerName}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#71695e]">
                          {formatThaiDate(row.borrowedAt)}
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#71695e]">
                          {formatThaiDate(row.dueDate)}
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#71695e]">
                          {row.returnedAt ? formatThaiDate(row.returnedAt) : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {row.returnedAt ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e2ebd8] text-[#43633a]">
                              คืนแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7f0d8] text-[#8c6d23]">
                              กำลังยืม
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen A4 PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={data}
        initialReportType={activeTab}
      />
    </div>
  );
}
