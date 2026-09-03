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
  LogOut,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserProfile, Profile } from "@/actions/auth";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";
import { useSidebar } from "@/components/layout/SidebarContext";

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
  const { isOpen, close } = useSidebar();
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

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Brand Header Logo */}
        <div className="flex items-center justify-between px-2 py-1">
          <Link
            href="/dashboard"
            onClick={isMobile ? close : undefined}
            className="flex items-center gap-[9px]"
          >
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

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={close}
              className="p-1.5 rounded-lg text-[#71695e] hover:text-[#211f1c] hover:bg-[#dfdad0] cursor-pointer transition-colors"
              aria-label="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={isMobile ? close : undefined}
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

      {/* User Profile Footer with Profile Link & Logout Trigger */}
      <div className="pt-4 border-t border-[#ddd6c6] flex items-center justify-between">
        <Link
          href="/profile"
          onClick={isMobile ? close : undefined}
          className="flex items-center gap-3 min-w-0 pr-2 p-1.5 -ml-1.5 rounded-lg hover:bg-[#dfdad0] transition-colors cursor-pointer group flex-1"
          title="ดูโปรไฟล์ของคุณ"
        >
          <div className="w-8 h-8 rounded-full bg-[#5d7d54] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#211f1c] truncate group-hover:text-[#c2593c] transition-colors">
              {displayName}
            </p>
            <p className="text-[11px] text-[#8b8271] truncate">{displayRole}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => {
            if (isMobile) close();
            setIsLogoutOpen(true);
          }}
          title="ออกจากระบบ"
          className="p-1.5 rounded-md text-[#71695e] hover:text-[#b3401f] hover:bg-[#dfdad0] transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and above) */}
      <aside className="hidden lg:flex w-60 bg-[#eae7dc] border-r border-[#ddd6c6] flex-col p-4 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (under lg) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative w-72 max-w-[80vw] bg-[#eae7dc] border-r border-[#ddd6c6] flex flex-col p-4 shadow-2xl z-10 min-h-full animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Confirmation Popup Modal */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        profile={profile}
      />
    </>
  );
}
