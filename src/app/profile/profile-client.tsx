"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/client";

export function ProfileClient({
  defaultEmail,
  defaultName,
  defaultRole,
  defaultTeam
}: {
  defaultEmail: string;
  defaultName: string;
  defaultRole: string;
  defaultTeam: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    startTransition(async () => {
      if (password && password.length < 8) {
        setMessage("Password must be at least 8 characters.");
        return;
      }

      if (password) {
        const { error } = supabase ? await supabase.auth.updateUser({ password }) : { error: new Error("Supabase is not configured.") };
        if (error) {
          setMessage(error.message);
          return;
        }
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!result.ok) {
        setMessage(result.message ?? "Could not save profile.");
        return;
      }

      router.replace("/dashboard");
    });
  }

  return (
    <>
      <PageHeader title="Profile" description="Complete your account before using the production workspace." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={saveProfile}>
            <Input autoComplete="name" onChange={(event) => setName(event.target.value)} placeholder="Full name" required value={name} />
            <Input disabled value={defaultEmail} />
            <Input disabled value={defaultRole} />
            <Input disabled value={defaultTeam} />
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create password optional"
              type="password"
              value={password}
            />
            <Button disabled={isPending || !name.trim()} type="submit">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </form>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
    </>
  );
}
