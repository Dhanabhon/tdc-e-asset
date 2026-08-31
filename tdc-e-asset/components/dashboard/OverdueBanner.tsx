import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface OverdueBannerProps {
  count: number;
}

export function OverdueBanner({ count }: OverdueBannerProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-[#f7e5df] border border-[#e5b8a8] rounded-xl px-4 py-3 text-xs text-[#7a2c14] shadow-xs transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-[#b3401f] animate-pulse shrink-0" />
        <span className="font-medium truncate">
          มีครุภัณฑ์เกินกำหนดคืน <span className="font-bold text-[#b3401f]">{count}</span> รายการ — รายการที่เกิน 30 วันขึ้นไปควรติดตามด่วน
        </span>
      </div>
      <Link
        href="/borrow-return?filter=overdue"
        className="font-semibold text-[#b3401f] hover:text-[#8a2a0f] hover:underline flex items-center gap-1 shrink-0 ml-3 transition-colors"
      >
        <span>ดูทั้งหมด</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
