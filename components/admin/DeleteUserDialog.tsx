"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUser, Profile } from "@/actions/users";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  currentUserId?: string;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
}: DeleteUserDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !user) return null;

  const isSelf = user.id === currentUserId;

  const handleDelete = () => {
    if (isSelf) {
      setErrorMessage("ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteUser(user.id);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#211f1c]">ยืนยันการลบผู้ใช้งาน</h3>
            <p className="text-xs text-[#71695e] mt-0.5">
              การดำเนินการนี้จะเพิกถอนสิทธิ์การเข้าถึงระบบของผู้ใช้งานรายนี้
            </p>
          </div>
        </div>

        {/* Self-deletion warning */}
        {isSelf && (
          <div className="bg-[#fef8e7] border border-[#eed79b] text-[#8c6d23] p-3 rounded-xl flex items-start gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>บัญชีนี้คือบัญชีของคุณเอง:</strong> ระบบไม่อนุญาตให้ลบบัญชีที่กำลังล็อกอินอยู่ เพื่อความปลอดภัยของระบบ
            </span>
          </div>
        )}

        {/* User Card */}
        <div className="bg-[#f5f2ea] border border-[#e3ddcd] rounded-xl p-3.5 space-y-1 text-xs">
          <div className="font-bold text-[#211f1c]">
            {user.full_name || "ไม่ระบุชื่อ"} ({user.email})
          </div>
          <div className="text-[#71695e]">
            หน่วยงาน: {user.department || "-"} · ระดับสิทธิ์: {user.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : "เจ้าหน้าที่ (Staff)"}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e3ddcd]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-[#d8d2c2] bg-white text-[#4a453d] text-xs h-9 px-4 rounded-lg cursor-pointer"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isPending || isSelf}
            className="bg-[#b3401f] hover:bg-[#8f3318] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังลบ...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันลบผู้ใช้งาน</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
