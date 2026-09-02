import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getUsers } from "@/actions/users";
import { UserManagementClient } from "@/components/admin/UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const usersData = await getUsers();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-sm text-[#71695e]">
          <Loader2 className="w-5 h-5 animate-spin text-[#c2593c] mr-2" />
          <span>กำลังโหลดข้อมูลผู้ใช้งาน...</span>
        </div>
      }
    >
      <UserManagementClient initialData={usersData} />
    </Suspense>
  );
}
