"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMagicLinkViaResend } from "@/lib/resend/client";
import { Database } from "@/lib/types/database.types";

import { validateEmailFormat } from "@/lib/validations/auth";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Sends a passwordless Magic Link to the user's email using Resend and Supabase.
 */
export async function signInWithMagicLink(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const email = formData.get("email") as string;
    const validation = validateEmailFormat(email);

    if (!validation.isValid) {
      return { error: validation.error || "รูปแบบอีเมลไม่ถูกต้อง" };
    }

    const cleanEmail = email.trim().toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://dummy.supabase.co") {
      return {
        error: "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน Vercel Environment Variables กรุณาตั้งค่าใน Vercel Dashboard > Settings > Environment Variables ก่อนเข้าสู่ระบบ",
      };
    }

    // Dynamic origin detection for Vercel production, preview & local dev
    let origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin || (process.env.NODE_ENV === "production" && origin.includes("localhost"))) {
      try {
        const headerList = await headers();
        const host = headerList.get("x-forwarded-host") || headerList.get("host");
        const proto = headerList.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
        if (host && !host.includes("localhost")) {
          origin = `${proto}://${host}`;
        } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
          origin = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else if (process.env.VERCEL_URL) {
          origin = `https://${process.env.VERCEL_URL}`;
        } else {
          origin = "http://localhost:3000";
        }
      } catch {
        origin = "http://localhost:3000";
      }
    }

    const cleanOrigin = origin ? origin.trim().replace(/\/+$/, "") : "http://localhost:3000";
    const emailRedirectTo = `${cleanOrigin}/auth/callback`;

    // Priority 1: Direct Resend delivery via Supabase Admin generateLink
    const adminClient = createAdminClient();
    const hasResendApiKey = !!process.env.RESEND_API_KEY;

    if (adminClient && hasResendApiKey) {
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: cleanEmail,
        options: {
          redirectTo: emailRedirectTo,
        },
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.warn("Could not generate link via admin API, falling back to signInWithOtp:", linkError?.message);
      } else {
        const resendResult = await sendMagicLinkViaResend({
          to: cleanEmail,
          magicLink: linkData.properties.action_link,
        });

        if (resendResult.success) {
          return { success: true };
        }
        console.warn("Direct Resend email delivery failed, falling back to signInWithOtp:", resendResult.error);
      }
    }

    // Priority 2: Standard Supabase signInWithOtp (which uses Resend SMTP configured in Supabase settings)
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      return { error: error.message || "ไม่สามารถส่งลิงก์เข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("signInWithMagicLink error:", err);
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
    return { error: msg };
  }
}

/**
 * Verifies 6-digit email OTP token.
 */
export async function verifyEmailOtp(email: string, token: string): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!email || !email.includes("@")) {
      return { error: "กรุณาระบุอีเมลที่ถูกต้อง" };
    }

    if (!token || token.trim().length === 0) {
      return { error: "กรุณาระบุรหัส OTP 6 หลัก" };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "email",
    });

    if (error) {
      return { error: error.message || "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("verifyEmailOtp error:", err);
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตรวจสอบรหัส OTP";
    return { error: msg };
  }
}

/**
 * Signs out current user, invalidates layout cache, and redirects to /.
 */
export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("signOut error:", err);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Retrieves the currently logged-in user profile from `profiles` table.
 */
export async function getUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return {
        id: user.id,
        email: user.email ?? "",
        full_name: (user.user_metadata?.full_name as string) || (user.email ? user.email.split("@")[0] : "ผู้ดูแลระบบ"),
        department: "กองเทคโนโลยีสารสนเทศ",
        role: (user.user_metadata?.role as string) || "admin",
        created_at: user.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return profile;
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return null;
  }
}

/**
 * Updates the currently logged-in user's own profile (full_name, department).
 */
export async function updateCurrentUserProfile(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
    }

    const fullName = (formData.get("full_name") as string)?.trim();
    const department = (formData.get("department") as string)?.trim() || null;

    if (!fullName || fullName.length < 2) {
      return { error: "ชื่อ-นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร" };
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      return { error: profileError.message || "ไม่สามารถอัปเดตข้อมูลส่วนตัวได้" };
    }

    // Sync auth user_metadata as well
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        department,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("updateCurrentUserProfile error:", err);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว" };
  }
}

