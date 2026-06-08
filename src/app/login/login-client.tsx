"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpenCheck, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(searchParams.get("message") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.replace("/dashboard");
    });
  }

  function sendEmailLink() {
    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      });
      setMessage(error ? error.message : "Check your email for a sign-in link.");
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <CardTitle>NPCP</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={signInWithPassword}>
            <Input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="Email" required type="email" value={email} />
            <Input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              value={password}
            />
            <Button className="w-full" disabled={isPending || !email || !password} type="submit">
              <ShieldCheck className="h-4 w-4" />
              Sign in
            </Button>
            <Button className="w-full" disabled={isPending || !email} onClick={sendEmailLink} type="button" variant="outline">
              <Mail className="h-4 w-4" />
              Email sign-in link
            </Button>
          </form>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
