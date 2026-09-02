"use client";

import { useState } from "react";
import { Printer, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetDetail } from "@/actions/assets";
import { formatThaiDate } from "@/lib/utils";

interface AssetTagPrintModalProps {
  asset: AssetDetail;
}

export function AssetTagPrintModal({ asset }: AssetTagPrintModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const registeredDate = formatThaiDate(asset.created_at);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-[#d8d2c2] bg-white text-[#211f1c] hover:bg-[#faf9f5] hover:text-[#c2593c] text-xs font-semibold h-9 px-3.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
        title="พิมพ์ฉลากติดพัสดุราชการ"
      >
        <Printer className="w-3.5 h-3.5 text-[#c2593c]" />
        <span>พิมพ์ฉลากพัสดุ</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-[#faf9f5] border border-[#d8d2c2] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 print:border-0 print:p-0 print:shadow-none print:max-w-none">
            {/* Modal Header (Hidden on Print) */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e3ddcd] print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f5f0e6] border border-[#ddd6c6] text-[#c2593c] flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211f1c]">พิมพ์ฉลากติดครุภัณฑ์ราชการ</h3>
                  <p className="text-[11px] text-[#71695e]">ตัวอย่างป้ายสติกเกอร์สำหรับติดบนตัวอุปกรณ์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#8b8271] hover:text-[#211f1c] hover:bg-[#eae7dc] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Tag Container */}
            <div className="p-4 bg-white border-2 border-dashed border-[#cfc7b4] rounded-xl flex items-center justify-center print:border-0 print:p-0">
              {/* The Actual Official Government Sticker */}
              <div
                id="printable-asset-tag"
                className="w-full max-w-md bg-white border-2 border-black p-4 rounded-md text-black font-sans shadow-sm print:shadow-none print:border-2 print:border-black print:w-[85mm] print:max-w-none"
              >
                {/* Tag Header */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-xs font-bold font-serif">
                      e
                    </div>
                    <div>
                      <div className="text-[11px] font-black tracking-tight leading-none uppercase">
                        TDC e-Asset Management
                      </div>
                      <div className="text-[9px] font-semibold text-gray-700 leading-tight">
                        {asset.department || "กองเทคโนโลยีสารสนเทศ"}
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold px-1.5 py-0.5 border border-black rounded">
                    พัสดุราชการ
                  </div>
                </div>

                {/* Main Code & Barcode */}
                <div className="space-y-1.5 text-center my-3 bg-gray-50 border border-gray-200 p-2.5 rounded">
                  <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                    รหัสครุภัณฑ์ (Asset Number)
                  </div>
                  <div className="text-base font-black font-mono tracking-wider text-black">
                    {asset.asset_code}
                  </div>

                  {/* Simulated Code 128 Barcode */}
                  <div className="py-1 flex justify-center items-center gap-0.5 h-9 overflow-hidden">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const widths = [1, 2, 1, 3, 2, 1, 2, 3, 1, 2];
                      const w = widths[i % widths.length];
                      return (
                        <div
                          key={i}
                          className="bg-black h-full"
                          style={{ width: `${w}px` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-2 text-[10px] leading-snug border-t border-gray-300 pt-2 mb-2">
                  <div className="col-span-2 space-y-1">
                    <div>
                      <span className="font-bold">รายการ: </span>
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    {asset.brand_model && (
                      <div>
                        <span className="font-bold">ยี่ห้อ/รุ่น: </span>
                        <span>{asset.brand_model}</span>
                      </div>
                    )}
                    {asset.serial_number && (
                      <div>
                        <span className="font-bold">S/N: </span>
                        <span className="font-mono">{asset.serial_number}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold">สถานที่: </span>
                      <span>{asset.location || "-"}</span>
                    </div>
                  </div>

                  {/* QR Code Simulation */}
                  <div className="flex flex-col items-center justify-center border-l border-gray-200 pl-2">
                    <div className="w-14 h-14 border border-black p-1 flex items-center justify-center bg-white">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <span className="text-[8px] font-mono mt-1 text-gray-500">Scan to View</span>
                  </div>
                </div>

                {/* Tag Footer Warning */}
                <div className="border-t border-black pt-1.5 text-center text-[8px] font-medium text-gray-800">
                  ทรัพย์สินของทางราชการ ห้ามแกะ ทำลาย หรือเคลื่อนย้ายโดยไม่ได้รับอนุญาต · ตรวจรับเมื่อ: {registeredDate}
                </div>
              </div>
            </div>

            {/* Modal Actions (Hidden on Print) */}
            <div className="flex items-center justify-between pt-2 print:hidden">
              <span className="text-[11px] text-[#8b8271]">
                แนะนำ: ตั้งค่าเครื่องพิมพ์เป็นกระดาษขนาดสติกเกอร์ (8.5 x 5.5 ซม.)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-[#d8d2c2] text-xs h-9 px-4 rounded-lg cursor-pointer"
                >
                  ปิด
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>สั่งพิมพ์ฉลาก (Print)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
