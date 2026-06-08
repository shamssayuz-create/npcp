import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?message=Supabase%20is%20not%20configured%20yet.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
