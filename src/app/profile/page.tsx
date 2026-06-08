import { AppShell } from "@/components/app/app-shell";
import { ProfileClient } from "@/app/profile/profile-client";
import { requireUser } from "@/lib/auth/require-user";
import { createServiceClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await requireUser();
  const serviceSupabase = createServiceClient();
  const { data: profile } = serviceSupabase
    ? await serviceSupabase.from("users").select("name, email, role, team_name, invitation_status").eq("email", user.email).maybeSingle()
    : { data: null };

  return (
    <AppShell>
      <ProfileClient
        defaultEmail={user.email ?? profile?.email ?? ""}
        defaultName={profile?.name ?? user.user_metadata?.name ?? ""}
        defaultRole={profile?.role ?? user.user_metadata?.role ?? "Team Member"}
        defaultTeam={profile?.team_name ?? user.user_metadata?.team_name ?? "Production"}
      />
    </AppShell>
  );
}
