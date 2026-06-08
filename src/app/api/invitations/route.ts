import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const invitationSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  role: z.enum(["Super Admin", "Manager", "Team Leader", "Team Member"]),
  team_name: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = invitationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid email invitation." }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ ok: true, message: "Demo invitation recorded. Supabase email invite will run after production credentials are enabled." });
  }

  const { name, email, role, team_name } = parsed.data;
  const redirectTo = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : undefined;
  const invited = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name, role, team_name },
    redirectTo
  });

  if (invited.error) {
    return NextResponse.json({ ok: false, message: invited.error.message }, { status: 400 });
  }

  const userRow = {
    ...(invited.data.user?.id ? { id: invited.data.user.id } : {}),
    name: name || email.split("@")[0],
    email,
    role,
    team_name,
    invitation_status: "Invited",
    invited_at: new Date().toISOString(),
    joined_at: null
  };

  await supabase.from("users").upsert(userRow, { onConflict: "email" });

  return NextResponse.json({ ok: true, message: "Invitation sent." });
}
