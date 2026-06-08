import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const supportedTypes = new Set(["signup", "invite", "magiclink", "recovery", "email_change"]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!tokenHash || !type || !supportedTypes.has(type)) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", "The invitation link is missing required details.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = supabase
    ? await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change"
      })
    : { error: new Error("Supabase is not configured.") };

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", error.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
