import Link from "next/link";
import { Search, ArrowLeft, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#f7e5df] border border-[#f0c2b5] text-[#c2593c] flex items-center justify-center shadow-xs">
        <Package className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#eae7dc] text-[#71695e]">
          404 · ไม่พบหน้าเว็บ
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
          ขออภัย ไม่พบหน้าที่คุณค้นหา
        </h1>
        <p className="text-xs text-[#71695e] leading-relaxed">
          หน้าเว็บหรือข้อมูลครุภัณฑ์ที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือ URL ที่ระบุไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link href="/dashboard">
          <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold h-10 px-5 rounded-lg shadow-sm cursor-pointer">
            <Home className="w-4 h-4 mr-1.5" /> กลับสู่หน้าแดชบอร์ด
          </Button>
        </Link>
        <Link href="/assets">
          <Button
            variant="outline"
            className="border-[#d8d2c2] bg-white hover:bg-[#eae7dc] text-[#4a453d] text-xs font-semibold h-10 px-5 rounded-lg cursor-pointer"
          >
            <Search className="w-4 h-4 mr-1.5" /> ค้นหาทะเบียนครุภัณฑ์
          </Button>
        </Link>
      </div>
    </div>
  );
}
