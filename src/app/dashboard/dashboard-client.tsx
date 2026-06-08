"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BookOpenCheck, CheckCircle2, FileText, ListChecks, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { ReportFilterBar } from "@/components/app/filters";
import { StatusBadge } from "@/components/app/status-badge";
import { seedData } from "@/lib/seed-data";
import { breakdownBy, dailyTrend, dashboardMetrics, workload } from "@/lib/reporting";
import { formatNumber } from "@/lib/utils";
import type { ReportFilters } from "@/lib/types";

const chartColors = ["#059669", "#16a34a", "#84cc16", "#0d9488", "#d97706", "#dc2626"];

export function DashboardClient() {
  const [filters, setFilters] = useState<ReportFilters>({
    range: { from: "2026-06-01", to: "2026-06-08" },
    team: "All",
    userId: "All",
    category: "All",
    status: "All"
  });

  const metrics = useMemo(() => dashboardMetrics(seedData, filters), [filters]);
  const trend = useMemo(() => dailyTrend(seedData, filters), [filters]);
  const statusData = useMemo(() => breakdownBy(seedData, filters, "status"), [filters]);
  const teamData = useMemo(() => breakdownBy(seedData, filters, "team"), [filters]);
  const workloadData = useMemo(() => workload(seedData), []);

  return (
    <>
      <PageHeader
        title="Production Dashboard"
        description="Live production health, completion trends, delayed courses, and team workload from course and activity records."
      />
      <ReportFilterBar data={seedData} filters={filters} onChange={setFilters} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard icon={BookOpenCheck} title="Active courses" value={metrics.activeCourses} />
        <KpiCard icon={CheckCircle2} title="Completed today" value={metrics.completedToday} />
        <KpiCard icon={FileText} title="Words produced" value={formatNumber(metrics.totalWordCount)} />
        <KpiCard icon={AlertTriangle} title="Delayed courses" value={metrics.delayedCourses} />
        <KpiCard icon={ListChecks} title="Modules completed" value={metrics.modulesCompleted} />
        <KpiCard icon={Timer} title="Avg. completion" value={`${metrics.averageCompletionTime.toFixed(1)}d`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Daily Production Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area dataKey="words" name="Words" type="monotone" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="courses" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Output</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="words" name="Words" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Workload</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Member</TH>
                  <TH>Team</TH>
                  <TH>Active</TH>
                  <TH>Completed</TH>
                  <TH>Words</TH>
                </TR>
              </THead>
              <TBody>
                {workloadData.slice(0, 7).map((item) => (
                  <TR key={item.id}>
                    <TD className="font-medium">{item.name}</TD>
                    <TD>{item.team}</TD>
                    <TD>{item.active}</TD>
                    <TD>{item.completed}</TD>
                    <TD>{formatNumber(item.words)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Delayed Courses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Course</TH>
                <TH>Assigned</TH>
                <TH>Due</TH>
                <TH>Status</TH>
                <TH>Words</TH>
              </TR>
            </THead>
            <TBody>
              {seedData.courses
                .filter((course) => course.status !== "Completed" && course.due_date < filters.range.to)
                .map((course) => {
                  const user = seedData.users.find((item) => item.id === course.assigned_to);
                  return (
                    <TR key={course.id}>
                      <TD className="font-medium">{course.course_title}</TD>
                      <TD>{user?.name}</TD>
                      <TD>{course.due_date}</TD>
                      <TD>
                        <StatusBadge status={course.status} />
                      </TD>
                      <TD>{formatNumber(course.actual_word_count)}</TD>
                    </TR>
                  );
                })}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
