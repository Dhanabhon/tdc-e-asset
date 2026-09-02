"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, Profile } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile | null;
}

export function LogoutConfirmDialog({
  isOpen,
  onClose,
  profile,
}: LogoutConfirmDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    startTransition(async () => {
      try {
        // 1. Purge client-side session from browser memory/storage
        const browserClient = createClient();
        await browserClient.auth.signOut();
      } catch (err) {
        console.warn("Client signOut warning:", err);
      }

      try {
        // 2. Call server signOut action (clears HTTP cookies and redirects to /)
        await signOut();
      } catch (err: unknown) {
        // Next.js redirect() throws a NEXT_REDIRECT which is normal
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          return;
        }
        // Fallback: router navigation
        router.push("/");
        router.refresh();
      }
    });
  };

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "ผู้ดูแลระบบ";
  const displayEmail = profile?.email || "";
  const displayRole = profile?.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่";
  const displayDept = profile?.department || "กองเทคโนโลยีสารสนเทศ";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative"
      >
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 id="logout-dialog-title" className="text-base font-bold text-[#211f1c] tracking-tight">
              ยืนยันการออกจากระบบ
            </h3>
            <p className="text-xs text-[#71695e] leading-relaxed">
              คุณต้องการออกจากระบบ TDC e-Asset ใช่หรือไม่? การทำงานในเซสชันปัจจุบันจะสิ้นสุดลง
            </p>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-[#f0eee6] border border-[#e3ddcd] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#c2593c] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#211f1c] truncate">{displayName}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e3ddcd] text-[#4a453d] font-medium">
                {displayRole}
              </span>
            </div>
            <p className="text-[11px] text-[#71695e] truncate">{displayEmail || displayDept}</p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="flex items-center gap-2 text-[11px] text-[#8b8271] px-1">
          <ShieldAlert className="w-3.5 h-3.5 text-[#b08d3e] shrink-0" />
          <span>เพื่อความปลอดภัย กรุณาปิดแท็บเบราว์เซอร์หลังจากออกจากระบบในอุปกรณ์ส่วนกลาง</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e3ddcd]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-[#d8d2c2] bg-white hover:bg-[#eae7dc] text-[#4a453d] text-xs h-9 px-4 rounded-lg font-medium cursor-pointer"
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="bg-[#b3401f] hover:bg-[#8f3318] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังออกจากระบบ...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>ยืนยันออกจากระบบ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
