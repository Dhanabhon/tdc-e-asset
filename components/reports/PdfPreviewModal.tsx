"use client";

import { useState, useRef } from "react";
import {
  Printer,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportsDataResult } from "@/actions/reports";
import { A4ReportDocument } from "./A4ReportDocument";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportsDataResult;
  initialReportType?: "category" | "overdue" | "loans";
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  data,
  initialReportType = "category",
}: PdfPreviewModalProps) {
  // Document configurations
  const [reportType, setReportType] = useState<"category" | "overdue" | "loans">(initialReportType);
  const [budgetYear, setBudgetYear] = useState("2569");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLogo, setShowLogo] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85); // 85% default fits nicely on most screens

  const documentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 1.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.85);
  };

  const documentCode = `REP-${budgetYear}-${
    reportType === "category" ? "001" : reportType === "overdue" ? "002" : "003"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#2e3134] text-white">
      {/* CSS for print mode */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-a4-report,
          #printable-a4-report * {
            visibility: visible !important;
          }
          #printable-a4-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* TOP BAR */}
      <header className="h-14 bg-[#1f2124] border-b border-[#3c4043] px-5 flex items-center justify-between shrink-0 z-10 print:hidden">
        {/* Left: Document title & Code */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#e3ddcd] bg-[#33373a] px-2.5 py-1 rounded-md border border-[#484c50]">
            {documentCode}
          </span>
          <div className="h-4 w-px bg-[#484c50] hidden sm:block" />
          <h2 className="text-xs sm:text-sm font-semibold text-[#f0eee6] truncate">
            {reportType === "category" && "รายงานสรุปครุภัณฑ์ตามหมวดหมู่ (A4 PDF Preview)"}
            {reportType === "overdue" && "รายงานครุภัณฑ์เกินกำหนดคืน (A4 PDF Preview)"}
            {reportType === "loans" && "รายงานประวัติการยืม-คืน (A4 PDF Preview)"}
          </h2>
        </div>

        {/* Center: Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-[#2b2d30] border border-[#3c4043] rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-[#3c4043] text-[#c7c5be] cursor-pointer"
            title="ย่อขนาด"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 rounded hover:bg-[#3c4043] font-mono text-[11px] text-[#f0eee6] cursor-pointer"
            title="รีเซ็ตขนาด"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-[#3c4043] text-[#c7c5be] cursor-pointer"
            title="ขยายขนาด"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded hover:bg-[#3c4043] text-[#c7c5be] cursor-pointer"
            title="พอดีหน้าจอ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-[#484c50] bg-transparent text-[#e3ddcd] hover:bg-[#2b2d30] hover:text-white text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5 mr-1" /> ปิดหน้าต่าง
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-8 px-3 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ดาวน์โหลด PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="bg-[#211f1c] hover:bg-[#3a362f] text-white text-xs h-8 px-3 rounded-lg font-semibold flex items-center gap-1.5 border border-[#484c50] cursor-pointer"
            title="พิมพ์เอกสาร"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">พิมพ์</span>
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT: CANVAS (CENTER) + CONFIG SIDEBAR (RIGHT) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* CENTER / LEFT: A4 DOCUMENT CANVAS */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center bg-[#383b40]">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="my-2"
          >
            <A4ReportDocument
              ref={documentRef}
              data={data}
              reportType={reportType}
              showLogo={showLogo}
              showSignatures={showSignatures}
              showStats={showStats}
              budgetYear={budgetYear}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR: REPORT CONFIGURATION */}
        <aside className="w-full lg:w-80 bg-[#faf9f5] border-t lg:border-t-0 lg:border-l border-[#e3ddcd] text-[#211f1c] p-5 overflow-y-auto shrink-0 space-y-5 print:hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e3ddcd]">
            <Sliders className="w-4 h-4 text-[#c2593c]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c]">
              ตั้งค่ารายงาน (Report Settings)
            </h3>
          </div>

          {/* 1. Report Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#4a453d]">
              ประเภทรายงาน
            </label>
            <div className="space-y-1.5">
              {[
                { id: "category", label: "สรุปครุภัณฑ์ตามหมวดหมู่" },
                { id: "overdue", label: "ครุภัณฑ์เกินกำหนดคืน" },
                { id: "loans", label: "ประวัติการยืม-คืนล่าสุด" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setReportType(t.id as "category" | "overdue" | "loans")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer ${
                    reportType === t.id
                      ? "bg-[#211f1c] text-white border-[#211f1c]"
                      : "bg-white border-[#d8d2c2] text-[#4a453d] hover:bg-[#f5f2ea]"
                  }`}
                >
                  <span>{t.label}</span>
                  {reportType === t.id && <Check className="w-3.5 h-3.5 text-[#c2593c]" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Budget Year & Category Filters */}
          <div className="space-y-3 pt-3 border-t border-[#e3ddcd]">
            <div>
              <label className="block text-xs font-medium text-[#4a453d] mb-1">
                ปีงบประมาณ
              </label>
              <select
                value={budgetYear}
                onChange={(e) => setBudgetYear(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] focus:outline-none focus:border-[#c2593c] cursor-pointer"
              >
                <option value="2569">ปีงบประมาณ พ.ศ. 2569 (ปัจจุบัน)</option>
                <option value="2568">ปีงบประมาณ พ.ศ. 2568</option>
                <option value="2567">ปีงบประมาณ พ.ศ. 2567</option>
              </select>
            </div>

            {reportType === "category" && (
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  กรองหมวดหมู่
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] focus:outline-none focus:border-[#c2593c] cursor-pointer"
                >
                  <option value="all">แสดงทุกหมวดหมู่ (ทั้งหมด)</option>
                  {data.categoriesSummary.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.prefixCode ? `[${c.prefixCode}] ` : ""}
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3. Display Toggles */}
          <div className="space-y-2.5 pt-3 border-t border-[#e3ddcd]">
            <label className="block text-xs font-semibold text-[#4a453d] mb-1">
              องค์ประกอบเอกสาร
            </label>

            {/* Toggle Logo */}
            <label className="flex items-center justify-between p-2.5 bg-white border border-[#d8d2c2] rounded-lg cursor-pointer hover:bg-[#faf9f5]">
              <span className="text-xs text-[#211f1c]">แสดงตราสัญลักษณ์ TDC</span>
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="rounded border-[#d8d2c2] text-[#c2593c] focus:ring-[#c2593c] h-4 w-4 cursor-pointer"
              />
            </label>

            {/* Toggle Stats (for category) */}
            {reportType === "category" && (
              <label className="flex items-center justify-between p-2.5 bg-white border border-[#d8d2c2] rounded-lg cursor-pointer hover:bg-[#faf9f5]">
                <span className="text-xs text-[#211f1c]">แสดงกล่องสถิติสรุป 5 ช่อง</span>
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  className="rounded border-[#d8d2c2] text-[#c2593c] focus:ring-[#c2593c] h-4 w-4 cursor-pointer"
                />
              </label>
            )}

            {/* Toggle Signatures */}
            <label className="flex items-center justify-between p-2.5 bg-white border border-[#d8d2c2] rounded-lg cursor-pointer hover:bg-[#faf9f5]">
              <span className="text-xs text-[#211f1c]">แสดงช่องลงลายมือชื่อ</span>
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="rounded border-[#d8d2c2] text-[#c2593c] focus:ring-[#c2593c] h-4 w-4 cursor-pointer"
              />
            </label>
          </div>

          {/* 4. Language & Print Preset */}
          <div className="space-y-2 pt-3 border-t border-[#e3ddcd]">
            <label className="block text-xs font-medium text-[#4a453d]">
              ภาษาเอกสาร (Document Language)
            </label>
            <div className="flex items-center gap-2 p-2 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c]">
              <span>🇹🇭 ภาษาไทย (ทางการ)</span>
            </div>
          </div>

          {/* Download Button on Sidebar */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handlePrint}
              className="w-full bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-10 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>พิมพ์หรือบันทึกเป็น PDF</span>
            </Button>
            <p className="text-[10px] text-[#8b8271] text-center mt-1.5">
              ระบบจะเปิดตัวเลือก Save as PDF ในขนาด A4 อัตโนมัติ
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
