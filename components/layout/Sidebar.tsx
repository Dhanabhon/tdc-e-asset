"use client";

import { useState, useEffect } from "react";
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
import { getUserProfile, Profile } from "@/actions/auth";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";

const navigation = [
  { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { name: "ทะเบียนครุภัณฑ์", href: "/assets", icon: Package },
  { name: "ยืม–คืน", href: "/borrow-return", icon: ArrowLeftRight },
  { name: "หมวดหมู่", href: "/categories", icon: FolderTree },
  { name: "รายงาน", href: "/reports", icon: BarChart3 },
  { name: "ผู้ดูแลระบบ", href: "/admin", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getUserProfile().then((p) => {
      if (isMounted && p) {
        setProfile(p);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = profile?.full_name || (profile?.email ? profile.email.split("@")[0] : "สมชาย ใจดี");
  const displayRole = profile?.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่";
  const initials = profile?.full_name
    ? profile.full_name.trim().slice(0, 2)
    : profile?.email
    ? profile.email.slice(0, 2).toUpperCase()
    : "สจ";

  return (
    <>
      <aside className="w-60 bg-[#eae7dc] border-r border-[#ddd6c6] flex flex-col justify-between p-4 shrink-0 min-h-screen">
        <div className="space-y-6">
          {/* Brand Header Logo matching design 1a */}
          <Link href="/dashboard" className="flex items-center gap-[9px] px-2 py-[4px]">
            <div className="w-[28px] h-[28px] rounded-[7px] bg-[#c2593c] text-white flex items-center justify-center font-semibold text-[13px] font-serif-lora shrink-0 shadow-xs">
              e
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] tracking-tight text-[#211f1c] leading-none">
                TDC E-Asset
              </span>
              <span className="text-[10px] text-[#71695e] font-normal mt-0.5">
                กองเทคโนโลยีสารสนเทศ
              </span>
            </div>
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
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer with Logout Trigger */}
        <div className="pt-4 border-t border-[#ddd6c6] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-[#5d7d54] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#211f1c] truncate">{displayName}</p>
              <p className="text-[11px] text-[#8b8271] truncate">{displayRole}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            title="ออกจากระบบ"
            className="p-1.5 rounded-md text-[#71695e] hover:text-[#b3401f] hover:bg-[#dfdad0] transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Confirmation Popup Modal */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        profile={profile}
      />
    </>
  );
}
