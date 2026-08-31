import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const isLocalEnv = process.env.NODE_ENV === "development";

  const baseOrigin = isLocalEnv
    ? origin
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const targetPath = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${baseOrigin}${targetPath}`);
    }
  }

  // Error fallback redirect to /login?error=auth-failed
  return NextResponse.redirect(`${baseOrigin}/login?error=auth-failed`);
}
