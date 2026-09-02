"use client";

import { useState, useTransition } from "react";
import { UserCog, Loader2, AlertCircle, User, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUser, Profile } from "@/actions/users";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onSuccess?: () => void;
}

export function EditUserDialog({ isOpen, onClose, user, onSuccess }: EditUserDialogProps) {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <EditUserForm key={user.id} user={user} onClose={onClose} onSuccess={onSuccess} />
    </div>
  );
}

function EditUserForm({
  user,
  onClose,
  onSuccess,
}: {
  user: Profile;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [role, setRole] = useState<"admin" | "staff">((user.role as "admin" | "staff") || "staff");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("กรุณาระบุชื่อ-นามสกุล");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("department", department.trim());
      formData.append("role", role);

      const res = await updateUser(user.id, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#f5f0e6] border border-[#ddd6c6] text-[#c2593c] flex items-center justify-center shrink-0">
          <UserCog className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#211f1c]">แก้ไขข้อมูลผู้ใช้งาน</h3>
          <p className="text-xs text-[#71695e] mt-0.5">
            อีเมล: <strong className="text-[#211f1c]">{user.email}</strong>
          </p>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-[#4a453d] mb-1">
            ชื่อ-นามสกุล <span className="text-[#b3401f]">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="เช่น นายสมชาย ใจดี"
              className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg"
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-medium text-[#4a453d] mb-1">
            หน่วยงาน / สังกัด
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
            <Input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="เช่น กองเทคโนโลยีสารสนเทศ"
              className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
            ระดับสิทธิ์การเข้าถึง (Role) <span className="text-[#b3401f]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                role === "staff"
                  ? "bg-[#eef2e6] border-[#5d7d54] text-[#2c4c23]"
                  : "bg-white border-[#ddd6c6] text-[#4a453d] hover:bg-[#f5f2ea]"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="staff"
                checked={role === "staff"}
                onChange={() => setRole("staff")}
                className="mt-0.5 text-[#5d7d54]"
              />
              <div>
                <div className="text-xs font-bold">เจ้าหน้าที่ (Staff)</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  บันทึกยืม-คืน, ดูทะเบียนครุภัณฑ์
                </div>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                role === "admin"
                  ? "bg-[#f7e5df] border-[#c2593c] text-[#8f3318]"
                  : "bg-white border-[#ddd6c6] text-[#4a453d] hover:bg-[#f5f2ea]"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="mt-0.5 text-[#c2593c]"
              />
              <div>
                <div className="text-xs font-bold">ผู้ดูแลระบบ (Admin)</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  เข้าถึงได้ทุกฟังก์ชันและจัดการผู้ใช้
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e3ddcd]">
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
            type="submit"
            disabled={isPending}
            className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>บันทึกการแก้ไข</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
