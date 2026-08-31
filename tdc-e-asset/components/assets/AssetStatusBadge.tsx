import { cn } from "@/lib/utils";
import { AssetStatus } from "@/lib/types/database.types";

interface AssetStatusBadgeProps {
  status: AssetStatus | string;
  className?: string;
  isOverdue?: boolean;
}

export function AssetStatusBadge({ status, className, isOverdue }: AssetStatusBadgeProps) {
  if (isOverdue) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7e5df] text-[#b3401f] whitespace-nowrap",
          className
        )}
      >
        เกินกำหนดคืน
      </span>
    );
  }

  switch (status) {
    case "available":
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e2ebd8] text-[#43633a] whitespace-nowrap",
            className
          )}
        >
          พร้อมใช้งาน
        </span>
      );
    case "borrowed":
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eae7dc] text-[#211f1c] whitespace-nowrap",
            className
          )}
        >
          กำลังถูกยืม
        </span>
      );
    case "maintenance":
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7f0d8] text-[#8c6d23] whitespace-nowrap",
            className
          )}
        >
          ส่งซ่อม
        </span>
      );
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0eee6] text-[#71695e] whitespace-nowrap",
            className
          )}
        >
          {status}
        </span>
      );
  }
}
