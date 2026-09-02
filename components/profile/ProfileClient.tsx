"use client";

import { useState, useTransition } from "react";
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  ShieldAlert,
  Calendar, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut,
  Sparkles,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Profile, updateCurrentUserProfile } from "@/actions/auth";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";

interface ProfileClientProps {
  profile: Profile | null;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [department, setDepartment] = useState(profile?.department || "กองเทคโนโลยีสารสนเทศ");
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const displayName = profile?.full_name || (profile?.email ? profile.email.split("@")[0] : "ผู้ดูแลระบบ");
  const displayEmail = profile?.email || "";
  const displayRole = profile?.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : "เจ้าหน้าที่ (Staff)";
  const isAdmin = profile?.role === "admin";

  const initials = profile?.full_name
    ? profile.full_name.trim().slice(0, 2)
    : profile?.email
    ? profile.email.slice(0, 2).toUpperCase()
    : "ผด";

  const formatThaiDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const monthNames = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("กรุณาระบุชื่อ-นามสกุล");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("department", department.trim());

      const res = await updateCurrentUserProfile(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eae7dc] border border-[#ddd6c6] text-[11px] font-medium text-[#71695e] mb-2">
            <Sparkles className="w-3 h-3 text-[#c2593c]" />
            <span>บัญชีผู้ใช้งานระบบ</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
            โปรไฟล์ผู้ใช้งาน (User Profile)
          </h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            จัดการข้อมูลส่วนตัวและตรวจสอบสิทธิ์การเข้าถึงระบบ TDC e-Asset
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsLogoutOpen(true)}
          className="border-[#d8d2c2] bg-white text-[#b3401f] hover:bg-[#f7e5df] hover:text-[#8f3318] text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </Button>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden shadow-2xs">
            <div className="h-24 bg-gradient-to-r from-[#211f1c] to-[#3a3733] relative">
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isAdmin ? "bg-[#c2593c] text-white" : "bg-[#5d7d54] text-white"
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {isAdmin ? "Admin" : "Staff"}
                </span>
              </div>
            </div>

            <CardContent className="px-6 pb-6 pt-0 relative">
              {/* Avatar */}
              <div className="-mt-12 mb-4">
                <div className={`w-20 h-20 rounded-2xl text-white flex items-center justify-center text-2xl font-bold border-4 border-[#faf9f5] shadow-md ${
                  isAdmin ? "bg-[#c2593c]" : "bg-[#5d7d54]"
                }`}>
                  {initials}
                </div>
              </div>

              {/* Name & Title */}
              <div className="space-y-1 mb-5">
                <h2 className="text-lg font-bold text-[#211f1c] tracking-tight">
                  {displayName}
                </h2>
                <p className="text-xs text-[#71695e] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8b8271]" />
                  <span>{displayEmail}</span>
                </p>
              </div>

              {/* Details List */}
              <div className="space-y-3 pt-4 border-t border-[#efeadd] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8b8271] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#71695e]" /> หน่วยงาน
                  </span>
                  <span className="font-semibold text-[#211f1c] text-right">
                    {profile?.department || "กองเทคโนโลยีสารสนเทศ"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b8271] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#71695e]" /> บทบาท
                  </span>
                  <span className="font-semibold text-[#211f1c]">
                    {displayRole}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b8271] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#71695e]" /> สมาชิกตั้งแต่
                  </span>
                  <span className="text-[#524d44]">
                    {formatThaiDate(profile?.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b8271] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54]" /> สถานะบัญชี
                  </span>
                  <span className="text-[#43633a] font-medium bg-[#eef2e6] px-2 py-0.5 rounded-md text-[11px]">
                    เปิดใช้งาน (Active)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Overview */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] p-4 text-xs space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#211f1c]">
              <KeyRound className="w-4 h-4 text-[#c2593c]" />
              <span>ความปลอดภัยของบัญชี</span>
            </div>
            <p className="text-[#71695e] leading-relaxed text-[11px]">
              บัญชีนี้ได้รับการปกป้องด้วยระบบ <strong>Passwordless Authentication</strong> เข้าสู่ระบบผ่าน Magic Link หรือ Resend OTP โดยไม่ต้องจดจำรหัสผ่าน
            </p>
            <div className="bg-[#f5f2ea] border border-[#e3ddcd] rounded-lg p-2.5 flex items-center gap-2 text-[11px] text-[#524d44]">
              <Clock className="w-3.5 h-3.5 text-[#8b8271] shrink-0" />
              <span>เซสชันจะ Auto-Logout เมื่อไม่ใช้งานเกิน 30 วัน</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile & Role Permissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-2xs">
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-[#e3ddcd] pb-3">
                <h3 className="text-sm font-bold text-[#211f1c]">แก้ไขข้อมูลส่วนตัว</h3>
                <p className="text-xs text-[#71695e] mt-0.5">
                  ปรับปรุงชื่อที่แสดงและหน่วยงานของคุณในระบบงานครุภัณฑ์
                </p>
              </div>

              {/* Success Banner */}
              {successMessage && (
                <div className="bg-[#eef2e6] border border-[#c5dbb7] text-[#2c4c23] p-3 rounded-xl flex items-center gap-2 text-xs animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5d7d54]" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-xl flex items-center gap-2 text-xs animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="ชื่อ-นามสกุล"
                        className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg focus-visible:ring-[#c2593c]"
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
                        className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg focus-visible:ring-[#c2593c]"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Read Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-[#4a453d]">
                        อีเมลล็อกอิน
                      </label>
                      <span className="text-[10px] text-[#5d7d54] flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> ยืนยันแล้ว
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                      <Input
                        type="email"
                        value={displayEmail}
                        readOnly
                        disabled
                        className="pl-9 bg-[#f0eee6] border-[#ddd6c6] text-xs h-10 rounded-lg text-[#71695e] cursor-not-allowed opacity-90"
                      />
                    </div>
                    <p className="text-[10px] text-[#8b8271] mt-1">
                      อีเมลผูกกับระบบยืนยันตัวตน ไม่สามารถเปลี่ยนได้โดยตรง
                    </p>
                  </div>

                  {/* Role (Read Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-[#4a453d]">
                        สิทธิ์การใช้งาน (Role)
                      </label>
                      <span className="text-[10px] text-[#8b8271] flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> กำหนดโดยระบบ
                      </span>
                    </div>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                      <Input
                        type="text"
                        value={displayRole}
                        readOnly
                        disabled
                        className="pl-9 bg-[#f0eee6] border-[#ddd6c6] text-xs h-10 rounded-lg text-[#71695e] cursor-not-allowed opacity-90"
                      />
                    </div>
                    <p className="text-[10px] text-[#8b8271] mt-1">
                      ติดต่อผู้ดูแลระบบเพื่อขอปรับเปลี่ยนระดับสิทธิ์
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-[#efeadd]">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-9 px-5 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <span>บันทึกการเปลี่ยนแปลง</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Permissions Overview Card */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-2xs">
            <CardContent className="p-6 space-y-4">
              <div className="border-b border-[#e3ddcd] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#211f1c]">สิทธิ์การเข้าถึงของคุณ (Your Permissions)</h3>
                  <p className="text-xs text-[#71695e] mt-0.5">
                    ความสามารถที่คุณได้รับอนุญาตให้ดำเนินการในระบบ TDC e-Asset
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#eae7dc] text-[#4a453d]">
                  {profile?.role === "admin" ? "สิทธิ์สูงสุด (Admin)" : "สิทธิ์มาตรฐาน (Staff)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#e7e2d4]">
                  <CheckCircle2 className="w-4 h-4 text-[#5d7d54] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#211f1c]">เข้าถึงทะเบียนครุภัณฑ์</div>
                    <div className="text-[11px] text-[#71695e]">ค้นหา กรอง และตรวจสอบรายละเอียดสินทรัพย์ทั้งหมด</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#e7e2d4]">
                  <CheckCircle2 className="w-4 h-4 text-[#5d7d54] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#211f1c]">บันทึกยืม–คืนพัสดุ</div>
                    <div className="text-[11px] text-[#71695e]">บันทึกการยืม walk-in และประเมินสภาพการรับคืนแบบเรียลไทม์</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#e7e2d4]">
                  {isAdmin ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5d7d54] shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-[#8b8271] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-[#211f1c]">เพิ่ม แก้ไข และลบครุภัณฑ์</div>
                    <div className="text-[11px] text-[#71695e]">
                      {isAdmin ? "มีสิทธิ์เต็มในการจัดการทะเบียนพัสดุ" : "เฉพาะผู้ดูแลระบบเท่านั้น"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#e7e2d4]">
                  {isAdmin ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5d7d54] shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-[#8b8271] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-[#211f1c]">จัดการผู้ใช้งานและสิทธิ์ (Admin)</div>
                    <div className="text-[11px] text-[#71695e]">
                      {isAdmin ? "เชิญผู้ใช้ใหม่ ปรับบทบาท และลบบัญชี" : "เฉพาะผู้ดูแลระบบเท่านั้น"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        profile={profile}
      />
    </div>
  );
}
