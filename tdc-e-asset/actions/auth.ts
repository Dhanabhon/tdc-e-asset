"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "กรุณาระบุอีเมลที่ถูกต้อง" };
  }

  const supabase = await createClient();

  // Dynamic origin detection for Vercel production, preview & local dev
  let origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      origin = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (process.env.VERCEL_URL) {
      origin = `https://${process.env.VERCEL_URL}`;
    } else {
      origin = "http://localhost:3000";
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
