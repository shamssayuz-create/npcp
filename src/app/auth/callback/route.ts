import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const redirectUrl = new URL(next, requestUrl.origin);

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = supabase ? await supabase.auth.exchangeCodeForSession(code) : { error: new Error("Supabase is not configured.") };

    if (error) {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
