"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileUp, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { seedData } from "@/lib/seed-data";
import { courseProgress } from "@/lib/reporting";
import { formatNumber } from "@/lib/utils";
import type { AppData } from "@/lib/types";

function formatTimestamp(value: string) {
  const date = new Date(value);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const [data, setData] = useState<AppData>(seedData);
  const [uploadMessage, setUploadMessage] = useState("");
  const [manualWords, setManualWords] = useState("");
  const course = data.courses.find((item) => item.id === courseId);
  const modules = data.modules.filter((item) => item.course_id === courseId).sort((a, b) => a.module_number - b.module_number);
  const logs = data.activityLogs.filter((item) => item.course_id === courseId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const assignee = course ? data.users.find((user) => user.id === course.assigned_to) : null;
  const progress = course ? courseProgress(course, modules.length, modules.filter((module) => module.status === "Completed").length) : 0;

  const nextPendingModule = useMemo(() => modules.find((module) => module.status !== "Completed"), [modules]);

  if (!course) {
    return (
      <>
        <Link className="mb-4 inline-flex items-center gap-2 text-sm text-emerald-700" href="/courses">
          <ArrowLeft className="h-4 w-4" />
          Courses
        </Link>
        <Card>
          <CardContent className="p-6">Course not found.</CardContent>
        </Card>
      </>
    );
  }

  const selectedCourse = course;

  function updateCourseStatus(status: "In Progress" | "Completed") {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    setData((current) => ({
      ...current,
      courses: current.courses.map((item) =>
        item.id === courseId
          ? {
              ...item,
              status,
              completion_date: status === "Completed" ? today : item.completion_date,
              updated_at: now
            }
          : item
      ),
      modules:
        status === "Completed"
          ? current.modules.map((module) =>
              module.course_id === courseId ? { ...module, status: "Completed", completed_date: module.completed_date ?? today } : module
            )
          : current.modules,
      activityLogs: [
        ...current.activityLogs,
        {
          id: `log-${crypto.randomUUID()}`,
          user_id: selectedCourse.assigned_to,
          course_id: courseId,
          action: status === "Completed" ? "Course Completed" : "Course Started",
          details: { source: "course_detail" },
          created_at: now
        }
      ]
    }));
  }

  function completeModule(moduleId: string) {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    setData((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              status: "Completed",
              completed_date: today,
              word_count: module.word_count || Math.round(selectedCourse.target_word_count / Math.max(modules.length, 1))
            }
          : module
      ),
      courses: current.courses.map((item) => (item.id === courseId ? { ...item, status: "In Progress", updated_at: now } : item)),
      activityLogs: [
        ...current.activityLogs,
        {
          id: `log-${crypto.randomUUID()}`,
          user_id: selectedCourse.assigned_to,
          course_id: courseId,
          action: "Module Completed",
          details: { module_id: moduleId },
          created_at: now
        }
      ]
    }));
  }

  async function uploadFile(formData: FormData) {
    setUploadMessage("Uploading...");
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const result = (await response.json()) as { ok: boolean; wordCount?: number; message?: string; fileUrl?: string };
    if (result.ok) {
      setUploadMessage(result.wordCount ? `Word count extracted: ${formatNumber(result.wordCount)}` : "File uploaded. Add manual word count if needed.");
      if (result.wordCount) {
        setData((current) => ({
          ...current,
          courses: current.courses.map((item) =>
            item.id === courseId ? { ...item, actual_word_count: result.wordCount ?? item.actual_word_count, uploaded_file_url: result.fileUrl ?? null } : item
          )
        }));
      }
    } else {
      setUploadMessage(result.message ?? "Upload failed.");
    }
  }

  function saveManualWords() {
    const value = Number(manualWords);
    if (!value) return;
    setData((current) => ({
      ...current,
      courses: current.courses.map((item) => (item.id === courseId ? { ...item, actual_word_count: value, updated_at: new Date().toISOString() } : item)),
      activityLogs: [
        ...current.activityLogs,
        {
          id: `log-${crypto.randomUUID()}`,
          user_id: selectedCourse.assigned_to,
          course_id: courseId,
          action: "Manual Word Count Override",
          details: { word_count: value },
          created_at: new Date().toISOString()
        }
      ]
    }));
    setManualWords("");
  }

  return (
    <>
      <Link className="mb-4 inline-flex items-center gap-2 text-sm text-emerald-700" href="/courses">
        <ArrowLeft className="h-4 w-4" />
        Courses
      </Link>
      <PageHeader
        title={course.course_title}
        description={`${course.category} / ${course.subcategory} / Assigned to ${assignee?.name ?? "Unassigned"}`}
        actions={
          <div className="flex gap-2">
            {course.status === "Assigned" ? (
              <Button variant="outline" onClick={() => updateCourseStatus("In Progress")}>
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : null}
            {course.status !== "Completed" ? (
              <Button onClick={() => updateCourseStatus("Completed")}>
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <StatusBadge status={course.status} />
            </CardHeader>
            <CardContent>
              <Progress value={progress} />
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  <div className="text-muted-foreground">Assigned</div>
                  <div className="font-medium">{course.assigned_date}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Due</div>
                  <div className="font-medium">{course.due_date}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Words</div>
                  <div className="font-medium">{formatNumber(course.actual_word_count)} / {formatNumber(course.target_word_count)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Resources</div>
                  <div className="font-medium">{course.resource_count}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
              {nextPendingModule ? (
                <Button size="sm" onClick={() => completeModule(nextPendingModule.id)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Next
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>No.</TH>
                    <TH>Module</TH>
                    <TH>Words</TH>
                    <TH>Status</TH>
                    <TH>Completed</TH>
                    <TH className="text-right">Action</TH>
                  </TR>
                </THead>
                <TBody>
                  {modules.map((module) => (
                    <TR key={module.id}>
                      <TD>{module.module_number}</TD>
                      <TD className="font-medium">{module.module_title}</TD>
                      <TD>{formatNumber(module.word_count)}</TD>
                      <TD>
                        <StatusBadge status={module.status} />
                      </TD>
                      <TD>{module.completed_date ?? "-"}</TD>
                      <TD className="text-right">
                        {module.status !== "Completed" ? (
                          <Button size="sm" variant="outline" onClick={() => completeModule(module.id)}>
                            Complete
                          </Button>
                        ) : null}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Completed File</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={uploadFile} className="space-y-3">
                <input name="courseId" type="hidden" value={course.id} />
                <Input accept=".docx,.pdf" name="file" type="file" required />
                <Button className="w-full" type="submit">
                  <FileUp className="h-4 w-4" />
                  Upload
                </Button>
              </form>
              {uploadMessage ? <p className="mt-3 text-sm text-muted-foreground">{uploadMessage}</p> : null}
              <div className="mt-4 flex gap-2">
                <Input value={manualWords} onChange={(event) => setManualWords(event.target.value)} placeholder="Manual word count" type="number" />
                <Button aria-label="Save manual word count" size="icon" variant="outline" onClick={saveManualWords}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => {
                  const user = data.users.find((item) => item.id === log.user_id);
                  return (
                    <div key={log.id} className="relative border-l pl-4">
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary" />
                      <div className="text-sm font-medium">{log.action}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(log.created_at)} by {user?.name ?? "System"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
