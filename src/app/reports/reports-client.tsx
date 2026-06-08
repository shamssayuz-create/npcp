"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, BookCheck, FileText, ListChecks, Timer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { SegmentedControl } from "@/components/ui/tabs";
import { PageHeader } from "@/components/app/page-header";
import { ReportFilterBar } from "@/components/app/filters";
import { KpiCard } from "@/components/app/kpi-card";
import {
  CustomFieldEditor,
  CustomFieldValueInput,
  SaveHint,
  getCustomFieldValue,
  upsertCustomFieldValue
} from "@/components/app/custom-fields";
import { seedData } from "@/lib/seed-data";
import { readDemoData } from "@/lib/demo-data";
import { breakdownBy, dailyTrend, reportingSnapshot } from "@/lib/reporting";
import { formatNumber } from "@/lib/utils";
import type { AppData, ReportFilters } from "@/lib/types";

type View = "Daily" | "Weekly" | "Monthly";

export function ReportsClient() {
  const [data, setData] = useState<AppData>(seedData);
  const [view, setView] = useState<View>("Daily");
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    range: { from: "2026-06-01", to: "2026-06-08" },
    team: "All",
    userId: "All",
    category: "All",
    subcategory: "All",
    status: "All"
  });

  useEffect(() => {
    setData(readDemoData());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cpos-demo-data", JSON.stringify(data));
  }, [data]);

  const reportCustomFields = data.customFields.filter((field) => field.scope === "reports");
  const snapshot = useMemo(() => reportingSnapshot(data, filters), [data, filters]);
  const trend = useMemo(() => dailyTrend(data, filters), [data, filters]);
  const teamBreakdown = useMemo(() => breakdownBy(data, filters, "team"), [data, filters]);
  const categoryBreakdown = useMemo(() => breakdownBy(data, filters, "category"), [data, filters]);
  const performers = useMemo(() => breakdownBy(data, filters, "member"), [data, filters]);

  return (
    <>
      <PageHeader
        title="Automatic Reports"
        description="Daily, weekly, and monthly reports are generated from completed courses, completed modules, and activity logs."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowCustomFields((value) => !value)}>
              Custom Fields
            </Button>
            <SegmentedControl value={view} options={["Daily", "Weekly", "Monthly"]} onChange={setView} />
          </div>
        }
      />
      {showCustomFields ? (
        <CustomFieldEditor
          scope="reports"
          title="Report Custom Fields"
          fields={data.customFields}
          onFieldsChange={(customFields) => setData((current) => ({ ...current, customFields }))}
        />
      ) : null}

      <div className="mb-4">
        <SaveHint />
      </div>

      <ReportFilterBar data={data} filters={filters} onChange={setFilters} includeStatus={false} />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Report Custom Field Values</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reportCustomFields.map((field) => (
            <label key={field.id} className="grid gap-1 text-sm">
              <span className="font-medium">{field.label}</span>
              <CustomFieldValueInput
                field={field}
                value={getCustomFieldValue(data.customFieldValues, field.id, "reports")}
                onChange={(value) =>
                  setData((current) => ({
                    ...current,
                    customFieldValues: upsertCustomFieldValue(current.customFieldValues, field.id, "reports", value)
                  }))
                }
              />
            </label>
          ))}
          {reportCustomFields.length === 0 ? <p className="text-sm text-muted-foreground">No report custom fields yet.</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard icon={BookCheck} title="Courses completed" value={snapshot.completedCourses.length} />
        <KpiCard icon={ListChecks} title="Modules completed" value={snapshot.modules.length} />
        <KpiCard icon={FileText} title="Total word count" value={formatNumber(snapshot.totalWordCount)} />
        <KpiCard icon={TrendingUp} title="Avg. words/course" value={formatNumber(snapshot.averageWordCountPerCourse)} />
        <KpiCard icon={Timer} title="Avg. completion" value={`${snapshot.averageCompletionTime.toFixed(1)}d`} />
        <KpiCard icon={Award} title="Top performer" value={performers[0]?.name ?? "-"} detail={formatNumber(performers[0]?.words ?? 0)} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{view} Performance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line dataKey="courses" name="Courses" stroke="#059669" strokeWidth={2} />
                <Line dataKey="modules" name="Modules" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} height={60} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="words" name="Words" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Team</TH>
                  <TH>Courses</TH>
                  <TH>Completed</TH>
                  <TH>Words</TH>
                </TR>
              </THead>
              <TBody>
                {teamBreakdown.map((team) => (
                  <TR key={team.name}>
                    <TD className="font-medium">{team.name}</TD>
                    <TD>{team.courses}</TD>
                    <TD>{team.completed}</TD>
                    <TD>{formatNumber(team.words)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Performers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Member</TH>
                  <TH>Courses</TH>
                  <TH>Completed</TH>
                  <TH>Words</TH>
                </TR>
              </THead>
              <TBody>
                {performers.slice(0, 10).map((member) => (
                  <TR key={member.name}>
                    <TD className="font-medium">{member.name}</TD>
                    <TD>{member.courses}</TD>
                    <TD>{member.completed}</TD>
                    <TD>{formatNumber(member.words)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
