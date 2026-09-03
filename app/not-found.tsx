import Link from "next/link";
import { Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center text-center p-6 space-y-6 font-sans">
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
          หน้าเว็บหรือข้อมูลที่คุณต้องการเข้าถึงอาจถูกย้าย ลบ หรือ URL ที่ระบุไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link href="/dashboard">
          <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold h-10 px-5 rounded-lg shadow-sm cursor-pointer">
            <Home className="w-4 h-4 mr-1.5" /> เข้าสู่ระบบ / หน้าหลัก
          </Button>
        </Link>
      </div>
    </div>
  );
}
