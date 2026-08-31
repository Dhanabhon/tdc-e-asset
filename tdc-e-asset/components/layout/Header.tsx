"use client";

import { Bell, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-14 border-b border-[#e3ddcd] bg-[#faf9f5] px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
          <Input
            placeholder="ค้นหาด้วยรหัสครุภัณฑ์, ชื่อรายการ หรือ S/N..."
            className="pl-9 bg-white border-[#d8d2c2] text-xs h-9 focus-visible:ring-[#c2593c]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-[#8b8271] bg-[#f5f2ea] px-3 py-1.5 rounded-lg border border-[#e3ddcd]">
          <Calendar className="w-3.5 h-3.5 text-[#71695e]" />
          <span>ศุกร์ที่ 29 สิงหาคม 2569 (ปีงบ 2569)</span>
        </div>

        <button className="relative p-2 rounded-lg text-[#71695e] hover:bg-[#eae7dc] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c2593c]" />
        </button>
      </div>
    </header>
  );
}
