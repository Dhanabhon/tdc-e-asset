"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserPlus, 
  Search, 
  Pencil, 
  Trash2, 
  Info,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Profile, GetUsersResult } from "@/actions/users";
import { InviteUserDialog } from "@/components/admin/InviteUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";

interface UserManagementClientProps {
  initialData: GetUsersResult;
}

export function UserManagementClient({ initialData }: UserManagementClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);

  const users = initialData.users;

  // Filter users on client side for responsive search
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesRole;

    const matchesSearch =
      (u.full_name?.toLowerCase().includes(term) ?? false) ||
      u.email.toLowerCase().includes(term) ||
      (u.department?.toLowerCase().includes(term) ?? false);

    return matchesRole && matchesSearch;
  });

  const handleRefresh = () => {
    router.refresh();
  };

  const formatThaiDate = (dateStr: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
            จัดการผู้ใช้งานและสิทธิ์ (User Management)
          </h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            บริหารจัดการบัญชีผู้ดูแลระบบและเจ้าหน้าที่ในระบบ TDC e-Asset
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold h-10 px-4 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งาน / เชิญผู้ดูแล</span>
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#eef2e6] text-[#43633a] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#8b8271]">ผู้ใช้งานทั้งหมด</p>
            <p className="text-xl font-bold text-[#211f1c]">{initialData.totalCount} บัญชี</p>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#f7e5df] text-[#c2593c] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#8b8271]">ผู้ดูแลระบบ (Admin)</p>
            <p className="text-xl font-bold text-[#c2593c]">{initialData.adminCount} คน</p>
          </div>
        </div>

        {/* Staff */}
        <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#f0eee6] text-[#524d44] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#8b8271]">เจ้าหน้าที่ (Staff)</p>
            <p className="text-xl font-bold text-[#211f1c]">{initialData.staffCount} คน</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 bg-[#f5f2ea] border border-[#e3ddcd] rounded-xl px-4 py-3 text-xs text-[#71695e]">
        <Info className="w-4 h-4 text-[#c2593c] shrink-0" />
        <span>
          ผู้ใช้งานทุกคนเข้าสู่ระบบผ่าน <strong>Passwordless Auth (Magic Link หรือ Resend Email)</strong> — ไม่มีการจัดเก็บรหัสผ่านในฐานข้อมูลเพื่อความปลอดภัยสูงสุด
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf9f5] border border-[#e3ddcd] p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, อีเมล หรือหน่วยงาน..."
            className="pl-9 bg-white border-[#d8d2c2] text-xs h-9 focus-visible:ring-[#c2593c]"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1 bg-[#eae7dc] p-1 rounded-lg self-start sm:self-auto">
          {[
            { label: "ทั้งหมด", value: "all" },
            { label: "ผู้ดูแลระบบ", value: "admin" },
            { label: "เจ้าหน้าที่", value: "staff" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                roleFilter === tab.value
                  ? "bg-white text-[#211f1c] font-semibold shadow-2xs"
                  : "text-[#71695e] hover:text-[#211f1c]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                <tr>
                  <th className="px-5 py-3">ผู้ใช้งาน</th>
                  <th className="px-4 py-3">อีเมล</th>
                  <th className="px-4 py-3">หน่วยงาน / สังกัด</th>
                  <th className="px-4 py-3 text-center">ระดับสิทธิ์</th>
                  <th className="px-4 py-3">วันที่เพิ่มในระบบ</th>
                  <th className="px-5 py-3 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeadd]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#8b8271]">
                      ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === initialData.currentUserId;
                    const initials = u.full_name
                      ? u.full_name.trim().slice(0, 2)
                      : u.email.slice(0, 2).toUpperCase();

                    return (
                      <tr key={u.id} className="hover:bg-[#f5f2ea] transition-colors">
                        {/* Name & Avatar */}
                        <td className="px-5 py-3.5 flex items-center gap-3 font-semibold text-[#211f1c]">
                          <div
                            className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs ${
                              u.role === "admin" ? "bg-[#c2593c]" : "bg-[#5d7d54]"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate">{u.full_name || "ไม่ระบุชื่อ"}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e3ddcd] text-[#4a453d] font-normal shrink-0">
                                  คุณ
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 text-[#524d44]">{u.email}</td>

                        {/* Department */}
                        <td className="px-4 py-3.5 text-[#71695e]">
                          {u.department || "-"}
                        </td>

                        {/* Role Badge */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7e5df] text-[#b3401f] border border-[#f0c8bc]">
                              <ShieldCheck className="w-3 h-3" />
                              ผู้ดูแลระบบ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef2e6] text-[#43633a] border border-[#d4e2c6]">
                              <UserCheck className="w-3 h-3" />
                              เจ้าหน้าที่
                            </span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-3.5 text-[#71695e] whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-[#8b8271]" />
                            <span>{formatThaiDate(u.created_at)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setEditingUser(u)}
                              className="h-8 px-2.5 text-xs text-[#524d44] hover:text-[#211f1c] hover:bg-[#eae7dc] cursor-pointer"
                              title="แก้ไขข้อมูล"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              แก้ไข
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setDeletingUser(u)}
                              disabled={isSelf}
                              className={`h-8 px-2.5 text-xs cursor-pointer ${
                                isSelf
                                  ? "opacity-30 text-[#8b8271] cursor-not-allowed"
                                  : "text-[#b3401f] hover:bg-[#f7e5df] hover:text-[#8f3318]"
                              }`}
                              title={isSelf ? "ไม่สามารถลบบัญชีของตนเองได้" : "ลบผู้ใช้งาน"}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              ลบ
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InviteUserDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={handleRefresh}
      />

      <EditUserDialog
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={handleRefresh}
      />

      <DeleteUserDialog
        isOpen={!!deletingUser}
        user={deletingUser}
        currentUserId={initialData.currentUserId}
        onClose={() => setDeletingUser(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
