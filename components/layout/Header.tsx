"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Calendar, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getThaiHeaderDate } from "@/lib/utils";
import { getUserProfile, Profile } from "@/actions/auth";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";

export function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const currentDateThai = getThaiHeaderDate(new Date());

  useEffect(() => {
    let isMounted = true;
    getUserProfile().then((p) => {
      if (isMounted && p) setProfile(p);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/assets?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-[#e3ddcd] bg-[#faf9f5] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วยรหัสครุภัณฑ์, ชื่อรายการ หรือ S/N..."
              className="pl-9 bg-white border-[#d8d2c2] text-xs h-9 focus-visible:ring-[#c2593c]"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#8b8271] bg-[#f5f2ea] px-3 py-1.5 rounded-lg border border-[#e3ddcd]">
            <Calendar className="w-3.5 h-3.5 text-[#71695e]" />
            <span>{currentDateThai}</span>
          </div>

          <button
            className="relative p-2 rounded-lg text-[#71695e] hover:bg-[#eae7dc] transition-colors cursor-pointer"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c2593c]" />
          </button>

          {/* User Profile Link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 rounded-lg text-[#71695e] hover:text-[#211f1c] hover:bg-[#eae7dc] transition-colors cursor-pointer"
            title="ดูโปรไฟล์ของคุณ"
          >
            <div className="w-7 h-7 rounded-full bg-[#5d7d54] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
              {profile?.full_name ? profile.full_name.trim().slice(0, 2) : profile?.email ? profile.email.slice(0, 2).toUpperCase() : "ผด"}
            </div>
            <span className="text-xs font-semibold text-[#211f1c] hidden lg:inline max-w-[120px] truncate">
              {profile?.full_name || profile?.email?.split("@")[0] || "โปรไฟล์"}
            </span>
          </Link>

          {/* Quick Logout Header Button */}
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            title="ออกจากระบบ"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#71695e] hover:text-[#b3401f] hover:bg-[#f7e5df] transition-colors cursor-pointer border border-transparent hover:border-[#e5b8a8]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {/* Confirmation Popup Modal */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        profile={profile}
      />
    </>
  );
}
