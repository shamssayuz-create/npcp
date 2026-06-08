"use client";

import { useState } from "react";
import { MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { seedData } from "@/lib/seed-data";
import type { Role, User } from "@/lib/types";

const roles: Role[] = ["Super Admin", "Manager", "Team Leader", "Team Member"];

export function UsersClient() {
  const [users, setUsers] = useState(seedData.users);
  const [message, setMessage] = useState("");

  async function inviteUser(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;
    const role = String(formData.get("role")) as Role;
    const teamName = String(formData.get("team") ?? "Production");
    const now = new Date().toISOString();
    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, team_name: teamName })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    const user: User = {
      id: `u-${crypto.randomUUID()}`,
      name: name || email.split("@")[0],
      email,
      role,
      team_name: teamName,
      invitation_status: "Invited",
      invited_at: now,
      joined_at: null,
      created_at: now
    };
    setUsers((current) => [user, ...current]);
    setMessage(result.message ?? "Invitation recorded.");
  }

  return (
    <>
      <PageHeader title="Users" description="Invite team members by email, assign roles, and group members by team for permissions and reporting." />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteUser} className="grid gap-3 md:grid-cols-5">
            <Input name="email" placeholder="Email" required type="email" />
            <Input name="name" placeholder="Name optional" />
            <Select name="role" defaultValue="Team Member">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            <Input name="team" placeholder="Team" defaultValue="Production" />
            <Button type="submit">
              <MailPlus className="h-4 w-4" />
              Send Invite
            </Button>
          </form>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Team</TH>
                <TH>Invite Status</TH>
                <TH>Created</TH>
              </TR>
            </THead>
            <TBody>
              {users.map((user) => (
                <TR key={user.id}>
                  <TD className="font-medium">{user.name}</TD>
                  <TD>{user.email}</TD>
                  <TD>
                    <Badge tone={user.role === "Super Admin" ? "blue" : user.role === "Manager" ? "green" : "grey"}>{user.role}</Badge>
                  </TD>
                  <TD>{user.team_name}</TD>
                  <TD>
                    <Badge tone={user.invitation_status === "Active" ? "green" : "amber"}>{user.invitation_status}</Badge>
                  </TD>
                  <TD>{user.created_at.slice(0, 10)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
