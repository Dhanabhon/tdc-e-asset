"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Sends a passwordless Magic Link to the user's email.
 */
export async function signInWithMagicLink(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const email = formData.get("email") as string;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return { error: "กรุณาระบุอีเมลที่ถูกต้อง" };
    }

    const cleanEmail = email.trim().toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://dummy.supabase.co") {
      return {
        error: "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน Vercel Environment Variables กรุณาตั้งค่าใน Vercel Dashboard > Settings > Environment Variables ก่อนเข้าสู่ระบบ",
      };
    }

    const supabase = await createClient();

    // Dynamic origin detection for Vercel production, preview & local dev
    let origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) {
      try {
        const headerList = await headers();
        const host = headerList.get("x-forwarded-host") || headerList.get("host");
        const proto = headerList.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
        if (host) {
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

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
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
