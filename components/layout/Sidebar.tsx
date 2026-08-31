"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FolderTree, 
  BarChart3, 
  ShieldCheck, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth";

const navigation = [
  { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { name: "ทะเบียนครุภัณฑ์", href: "/assets", icon: Package },
  { name: "ยืม–คืน", href: "/borrow-return", icon: ArrowLeftRight, badge: "7" },
  { name: "หมวดหมู่", href: "/categories", icon: FolderTree },
  { name: "รายงาน", href: "/reports", icon: BarChart3 },
  { name: "ผู้ดูแลระบบ", href: "/admin", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#eae7dc] border-r border-[#ddd6c6] flex flex-col justify-between p-4 shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Brand Header Logo matching design 1a */}
        <Link href="/dashboard" className="flex items-center gap-[9px] px-2 py-[4px]">
          <div className="w-[28px] h-[28px] rounded-[7px] bg-[#c2593c] text-white flex items-center justify-center font-semibold text-[13px] font-serif-lora shrink-0 shadow-xs">
            e
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#211f1c] leading-none">
            TDC E-Asset
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#211f1c] text-[#f0eee6] font-semibold"
                    : "text-[#4a453d] hover:bg-[#dfdad0] hover:text-[#211f1c]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#f0eee6]" : "text-[#71695e]")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-semibold rounded-full",
                      isActive ? "bg-[#c2593c] text-white" : "bg-[#c2593c] text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="pt-4 border-t border-[#ddd6c6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5d7d54] text-white flex items-center justify-center text-xs font-bold shrink-0">
            สจ
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#211f1c] truncate">สมชาย ใจดี</p>
            <p className="text-[11px] text-[#8b8271] truncate">ผู้ดูแลระบบ</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
          }}
          title="ออกจากระบบ"
          className="p-1.5 rounded-md text-[#71695e] hover:text-[#b3401f] hover:bg-[#dfdad0] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
