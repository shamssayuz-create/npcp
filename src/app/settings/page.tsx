import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";

const roadmap = ["Leave Management", "Attendance", "Performance Reviews", "Payroll Tracking", "Capacity Planning", "AI Productivity Insights"];

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" description="Operational setup for storage, notifications, Supabase, and future modules." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Setup</CardTitle>
            <Badge tone="blue">Ready</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Add Supabase URL, anon key, and service role key to enable auth, database reads, and storage uploads.</p>
            <p>Run the SQL in the Supabase folder, then create a public or signed storage bucket named course-files.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phase 2 Modules</CardTitle>
            <Badge>Planned</Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roadmap.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
