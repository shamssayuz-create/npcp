import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.")
});

export async function POST(request: Request) {
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter your name." }, { status: 400 });
  }

  const serverSupabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = serverSupabase ? await serverSupabase.auth.getUser() : { data: { user: null } };

  if (!user?.email) {
    return NextResponse.json({ ok: false, message: "Sign in again to finish your profile." }, { status: 401 });
  }

  const serviceSupabase = createServiceClient();
  if (!serviceSupabase) {
    return NextResponse.json({ ok: false, message: "Supabase service key is not configured." }, { status: 500 });
  }

  const { data: existing } = await serviceSupabase
    .from("users")
    .select("role, team_name, invited_at, joined_at")
    .eq("email", user.email)
    .maybeSingle();

  const role = existing?.role ?? user.user_metadata?.role ?? "Team Member";
  const teamName = existing?.team_name ?? user.user_metadata?.team_name ?? "Production";
  const now = new Date().toISOString();

  const { error } = await serviceSupabase.from("users").upsert(
    {
      id: user.id,
      name: parsed.data.name,
      email: user.email,
      role,
      team_name: teamName,
      invitation_status: "Active",
      invited_at: existing?.invited_at ?? now,
      joined_at: existing?.joined_at ?? now
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  await serviceSupabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      name: parsed.data.name,
      role,
      team_name: teamName
    }
  });

  return NextResponse.json({ ok: true, message: "Profile saved." });
}
