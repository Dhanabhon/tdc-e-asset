"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#f7e5df] border border-[#f0c2b5] text-[#b3401f] flex items-center justify-center shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#f7e5df] text-[#b3401f]">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
          ไม่สามารถแสดงผลหน้านี้ได้ชั่วคราว
        </h1>
        <p className="text-xs text-[#71695e] leading-relaxed">
          {error?.message && !error.message.includes("digest")
            ? error.message
            : "เกิดข้อผิดพลาดในระบบการเชื่อมต่อหรือการประมวลผลข้อมูล กรุณาลองใหม่อีกครั้ง"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={() => reset()}
          className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold h-10 px-5 rounded-lg shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> ลองใหม่อีกครั้ง
        </Button>
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="border-[#d8d2c2] bg-white hover:bg-[#eae7dc] text-[#4a453d] text-xs font-semibold h-10 px-5 rounded-lg cursor-pointer"
          >
            <Home className="w-4 h-4 mr-1.5" /> กลับสู่หน้าหลัก
          </Button>
        </Link>
      </div>
    </div>
  );
}
