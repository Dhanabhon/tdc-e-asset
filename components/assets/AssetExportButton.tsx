"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetWithCategory } from "@/actions/assets";

interface AssetExportButtonProps {
  assets: AssetWithCategory[];
}

export function AssetExportButton({ assets }: AssetExportButtonProps) {
  const handleExport = () => {
    if (!assets || assets.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    const headers = [
      "รหัสครุภัณฑ์",
      "ชื่อรายการ",
      "หมวดหมู่",
      "ยี่ห้อ/รุ่น",
      "หมายเลขเครื่อง (S/N)",
      "จำนวนคงเหลือ",
      "จำนวนทั้งหมด",
      "หน่วยงาน",
      "สถานที่ตั้ง",
      "สถานะ",
      "วันที่ลงทะเบียน",
    ];

    const statusMap: Record<string, string> = {
      available: "พร้อมใช้งาน",
      borrowed: "กำลังถูกยืม",
      maintenance: "ส่งซ่อม",
    };

    const rows = assets.map((a) => [
      `"${(a.asset_code || "").replace(/"/g, '""')}"`,
      `"${(a.name || "").replace(/"/g, '""')}"`,
      `"${(a.category?.name || "").replace(/"/g, '""')}"`,
      `"${(a.brand_model || "").replace(/"/g, '""')}"`,
      `"${(a.serial_number || "").replace(/"/g, '""')}"`,
      a.available_quantity ?? 0,
      a.quantity ?? 0,
      `"${(a.department || "").replace(/"/g, '""')}"`,
      `"${(a.location || "").replace(/"/g, '""')}"`,
      `"${statusMap[a.status] || a.status}"`,
      `"${a.created_at ? new Date(a.created_at).toLocaleDateString("th-TH") : ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tdc-assets-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold text-[#211f1c] cursor-pointer"
    >
      <Download className="w-4 h-4 mr-1.5" /> นำออก CSV / Excel
    </Button>
  );
}
