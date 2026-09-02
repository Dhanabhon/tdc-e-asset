import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getUserProfile } from "@/actions/auth";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getUserProfile();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-sm text-[#71695e]">
          <Loader2 className="w-5 h-5 animate-spin text-[#c2593c] mr-2" />
          <span>กำลังโหลดข้อมูลโปรไฟล์...</span>
        </div>
      }
    >
      <ProfileClient profile={profile} />
    </Suspense>
  );
}
