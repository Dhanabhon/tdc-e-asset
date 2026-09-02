"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, CheckCircle2, ArrowLeftRight, Wrench, AlertOctagon } from "lucide-react";
import { AssetStatusCounts } from "@/actions/assets";

interface AssetMiniKPIProps {
  counts: AssetStatusCounts;
}

export function AssetMiniKPI({ counts }: AssetMiniKPIProps) {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "";

  const items = [
    {
      label: "ครุภัณฑ์ทั้งหมด",
      count: counts.total,
      icon: Package,
      href: "/assets",
      active: !currentStatus,
      textColor: "text-[#211f1c]",
      badgeColor: "bg-[#f5f2ea] text-[#71695e]",
      activeClass: "border-[#211f1c] bg-[#faf9f5] ring-1 ring-[#211f1c]/10",
    },
    {
      label: "พร้อมใช้งาน",
      count: counts.available,
      icon: CheckCircle2,
      href: "/assets?status=available",
      active: currentStatus === "available",
      textColor: "text-[#43633a]",
      badgeColor: "bg-[#e2ebd8] text-[#43633a]",
      activeClass: "border-[#5d7d54] bg-[#eef2e6] ring-1 ring-[#5d7d54]/20",
    },
    {
      label: "กำลังถูกยืม",
      count: counts.borrowed,
      icon: ArrowLeftRight,
      href: "/assets?status=borrowed",
      active: currentStatus === "borrowed",
      textColor: "text-[#8c6d23]",
      badgeColor: "bg-[#f7f0d8] text-[#8c6d23]",
      activeClass: "border-[#c49830] bg-[#fbf7eb] ring-1 ring-[#c49830]/20",
    },
    {
      label: "ส่งซ่อม / ชำรุด",
      count: counts.maintenance,
      icon: Wrench,
      href: "/assets?status=maintenance",
      active: currentStatus === "maintenance",
      textColor: "text-[#b3401f]",
      badgeColor: "bg-[#f7e5df] text-[#b3401f]",
      activeClass: "border-[#c2593c] bg-[#fdf2ee] ring-1 ring-[#c2593c]/20",
    },
    {
      label: "สูญหาย",
      count: counts.lost,
      icon: AlertOctagon,
      href: "/assets?status=lost",
      active: currentStatus === "lost",
      textColor: "text-[#2c2826]",
      badgeColor: "bg-[#eceae5] text-[#2c2826]",
      activeClass: "border-[#2c2826] bg-[#f5f3ef] ring-1 ring-[#2c2826]/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between shadow-2xs ${
              item.active
                ? item.activeClass
                : "bg-[#faf9f5] border-[#e3ddcd] hover:border-[#cfc7b4] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg ${item.badgeColor}`}>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-[#71695e] truncate">
                  {item.label}
                </div>
                <div className={`text-lg font-bold font-serif leading-tight ${item.textColor}`}>
                  {item.count.toLocaleString()}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
