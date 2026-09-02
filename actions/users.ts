"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { Database } from "@/lib/types/database.types";
import { sendMagicLinkViaResend } from "@/lib/resend/client";
import { headers } from "next/headers";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface GetUsersResult {
  users: Profile[];
  totalCount: number;
  adminCount: number;
  staffCount: number;
  currentUserRole?: string;
  currentUserId?: string;
}

/**
 * Retrieves list of users from `profiles` table with optional search & role filter.
 */
export async function getUsers(options?: {
  search?: string;
  role?: string;
}): Promise<GetUsersResult> {
  try {
    const supabase = await createClient();

    // Check current user session
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const adminClient = createAdminClient();
    const db = adminClient || supabase;

    let query = db.from("profiles").select("*").order("created_at", { ascending: false });

    if (options?.role && options.role !== "all") {
      query = query.eq("role", options.role);
    }

    if (options?.search && options.search.trim().length > 0) {
      const term = options.search.trim();
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,department.ilike.%${term}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("getUsers error:", error);
      return {
        users: [],
        totalCount: 0,
        adminCount: 0,
        staffCount: 0,
      };
    }

    const userList = (users as Profile[]) || [];

    // Calculate role statistics
    const totalCount = userList.length;
    const adminCount = userList.filter((u) => u.role === "admin").length;
    const staffCount = userList.filter((u) => u.role === "staff").length;

    const currentUser = userList.find((u) => u.id === authUser?.id);

    return {
      users: userList,
      totalCount,
      adminCount,
      staffCount,
      currentUserRole: currentUser?.role || "admin",
      currentUserId: authUser?.id,
    };
  } catch (err) {
    console.error("getUsers exception:", err);
    return {
      users: [],
      totalCount: 0,
      adminCount: 0,
      staffCount: 0,
    };
  }
}

/**
 * Invites / Creates a new user into Supabase Auth & Profiles table.
 */
export async function createUserOrInvite(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawData = {
      email: formData.get("email"),
      full_name: formData.get("full_name"),
      department: formData.get("department"),
      role: formData.get("role") || "staff",
    };

    const validated = createUserSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "ข้อมูลผู้ใช้ไม่ถูกต้อง";
      return { error: firstError };
    }

    const { email, full_name, department, role } = validated.data;
    const cleanEmail = email.trim().toLowerCase();

    const adminClient = createAdminClient();
    if (!adminClient) {
      return {
        error: "ต้องตั้งค่า SUPABASE_SERVICE_ROLE_KEY ใน Vercel Environment Variables เพื่อเปิดใช้งานฟังก์ชันจัดการและเชิญผู้ใช้งานในระบบ",
      };
    }

    // Check if user already exists
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return { error: `มีผู้ใช้งานอีเมล "${cleanEmail}" อยู่ในระบบแล้ว` };
    }

    // 1. Create user in Supabase Auth via Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      email_confirm: true,
      user_metadata: {
        full_name,
        department,
        role,
      },
    });

    if (authError || !authData?.user) {
      console.error("Admin createUser error:", authError);
      return { error: authError?.message || "ไม่สามารถสร้างบัญชีผู้ใช้ในระบบได้" };
    }

    const newUserId = authData.user.id;

    // 2. Insert or update record in profiles table
    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: newUserId,
      email: cleanEmail,
      full_name,
      department,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Upsert profile error:", profileError);
    }

    // 3. Send Invitation Magic Link via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        let origin = process.env.NEXT_PUBLIC_SITE_URL;
        if (!origin || (process.env.NODE_ENV === "production" && origin.includes("localhost"))) {
          const headerList = await headers();
          const host = headerList.get("x-forwarded-host") || headerList.get("host");
          const proto = headerList.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
          if (host && !host.includes("localhost")) {
            origin = `${proto}://${host}`;
          } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            origin = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
          } else if (process.env.VERCEL_URL) {
            origin = `https://${process.env.VERCEL_URL}`;
          }
        }
        const cleanOrigin = origin ? origin.trim().replace(/\/+$/, "") : "http://localhost:3000";
        const emailRedirectTo = `${cleanOrigin}/auth/callback`;

        const { data: linkData } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: cleanEmail,
          options: { redirectTo: emailRedirectTo },
        });

        if (linkData?.properties?.action_link) {
          await sendMagicLinkViaResend({
            to: cleanEmail,
            magicLink: linkData.properties.action_link,
          });
        }
      } catch (emailErr) {
        console.warn("Invitation email sending warning:", emailErr);
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("createUserOrInvite error:", err);
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชิญผู้ใช้งาน";
    return { error: msg };
  }
}

/**
 * Updates an existing user's profile information and role.
 */
export async function updateUser(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawData = {
      full_name: formData.get("full_name"),
      department: formData.get("department"),
      role: formData.get("role"),
    };

    const validated = updateUserSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "ข้อมูลผู้ใช้ไม่ถูกต้อง";
      return { error: firstError };
    }

    const { full_name, department, role } = validated.data;

    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    // Update in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        department,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (profileError) {
      console.error("updateUser profile error:", profileError);
      return { error: profileError.message || "ไม่สามารถอัปเดตข้อมูลผู้ใช้งานได้" };
    }

    // Sync user_metadata in auth.users if admin client available
    if (adminClient) {
      await adminClient.auth.admin.updateUserById(id, {
        user_metadata: {
          full_name,
          department,
          role,
        },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateUser error:", err);
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้งาน";
    return { error: msg };
  }
}

/**
 * Deletes a user from profiles and auth.users.
 * Includes self-deletion protection and last-admin protection.
 */
export async function deleteUser(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Get current logged-in user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
    }

    // 2. Self-deletion protection: cannot delete oneself
    if (authUser.id === id) {
      return { error: "ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้" };
    }

    const adminClient = createAdminClient();
    const db = adminClient || supabase;

    // 3. Last Admin Protection: cannot delete if this is the only admin
    const { data: targetProfile } = await db
      .from("profiles")
      .select("role, email")
      .eq("id", id)
      .maybeSingle();

    if (targetProfile?.role === "admin") {
      const { data: allAdmins } = await db
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (allAdmins && allAdmins.length <= 1) {
        return {
          error: "ไม่สามารถลบได้ เนื่องจากระบบต้องมีผู้ดูแลระบบ (Admin) อย่างน้อย 1 คน",
        };
      }
    }

    // 4. Delete user record
    if (adminClient) {
      // Delete from auth.users (cascade will delete from profiles)
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(id);
      if (authDeleteError) {
        console.warn("Auth delete warning, attempting profiles direct delete:", authDeleteError.message);
        await db.from("profiles").delete().eq("id", id);
      }
    } else {
      const { error: profileDeleteError } = await db.from("profiles").delete().eq("id", id);
      if (profileDeleteError) {
        return { error: profileDeleteError.message || "ไม่สามารถลบผู้ใช้งานได้" };
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteUser error:", err);
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบผู้ใช้งาน";
    return { error: msg };
  }
}
