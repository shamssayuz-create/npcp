"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import {
  CustomFieldEditor,
  CustomFieldValueInput,
  SaveHint,
  getCustomFieldValue,
  upsertCustomFieldValue
} from "@/components/app/custom-fields";
import { seedData } from "@/lib/seed-data";
import { readDemoData } from "@/lib/demo-data";
import { courseProgress, courseStatuses } from "@/lib/reporting";
import { formatNumber } from "@/lib/utils";
import type { AppData, Course } from "@/lib/types";

export function CoursesClient() {
  const [data, setData] = useState<AppData>(seedData);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);

  useEffect(() => {
    setData(readDemoData());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("npcp-production-data-v1", JSON.stringify(data));
  }, [data]);

  const courseCustomFields = data.customFields.filter((field) => field.scope === "courses");

  const courses = useMemo(() => {
    return data.courses.filter((course) => {
      const user = data.users.find((item) => item.id === course.assigned_to);
      const haystack = `${course.course_title} ${course.category} ${course.subcategory} ${user?.name} ${course.status}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (status === "All" || course.status === status);
    });
  }, [data, query, status]);

  function startCourse(courseId: string) {
    setData((current) => ({
      ...current,
      courses: current.courses.map((course) =>
        course.id === courseId ? { ...course, status: "In Progress", updated_at: new Date().toISOString() } : course
      ),
      activityLogs: [
        ...current.activityLogs,
        {
          id: `log-${crypto.randomUUID()}`,
          user_id: current.courses.find((course) => course.id === courseId)?.assigned_to ?? "u-admin",
          course_id: courseId,
          action: "Course Started",
          details: { source: "course_list" },
          created_at: new Date().toISOString()
        }
      ]
    }));
  }

  function completeCourse(courseId: string) {
    const today = new Date().toISOString().slice(0, 10);
    setData((current) => ({
      ...current,
      courses: current.courses.map((course) =>
        course.id === courseId ? { ...course, status: "Completed", completion_date: today, updated_at: new Date().toISOString() } : course
      ),
      modules: current.modules.map((module) =>
        module.course_id === courseId ? { ...module, status: "Completed", completed_date: module.completed_date ?? today } : module
      ),
      activityLogs: [
        ...current.activityLogs,
        {
          id: `log-${crypto.randomUUID()}`,
          user_id: current.courses.find((course) => course.id === courseId)?.assigned_to ?? "u-admin",
          course_id: courseId,
          action: "Course Completed",
          details: { source: "course_list" },
          created_at: new Date().toISOString()
        }
      ]
    }));
  }

  function addCourse(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const assignedTo = String(formData.get("assignedTo") ?? "");
    if (!title || !assignedTo) return;
    const today = new Date().toISOString().slice(0, 10);
    const id = `c-${crypto.randomUUID()}`;
    const course: Course = {
      id,
      course_title: title,
      category: String(formData.get("category") ?? "Compliance"),
      subcategory: String(formData.get("subcategory") ?? "General"),
      assigned_to: assignedTo,
      assigned_by: "u-manager",
      assigned_date: today,
      due_date: String(formData.get("dueDate") ?? today),
      status: "Assigned",
      target_word_count: Number(formData.get("wordCount") ?? 0),
      actual_word_count: 0,
      resource_count: Number(formData.get("resources") ?? 0),
      completion_date: null,
      uploaded_file_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setData((current) => ({
      ...current,
      courses: [course, ...current.courses],
      modules: [
        ...Array.from({ length: 5 }, (_, index) => ({
          id: `${id}-m-${index + 1}`,
          course_id: id,
          module_number: index + 1,
          module_title: `Module ${index + 1}`,
          word_count: 0,
          status: "Pending" as const,
          completed_date: null,
          created_at: course.created_at
        })),
        ...current.modules
      ],
      activityLogs: [
        ...current.activityLogs,
        {
          id: `log-${crypto.randomUUID()}`,
          user_id: "u-manager",
          course_id: id,
          action: "Course Assigned",
          details: { assigned_to: assignedTo, due_date: course.due_date },
          created_at: new Date().toISOString()
        }
      ]
    }));
    setShowForm(false);
  }

  return (
    <>
      <PageHeader
        title="Courses"
        description="Create, assign, start, complete, and inspect production work without separate reporting entry."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowCustomFields((value) => !value)}>
              Custom Fields
            </Button>
            <Button onClick={() => setShowForm((value) => !value)}>
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </div>
        }
      />

      {showCustomFields ? (
        <CustomFieldEditor
          scope="courses"
          title="Course Custom Fields"
          fields={data.customFields}
          onFieldsChange={(customFields) => setData((current) => ({ ...current, customFields }))}
        />
      ) : null}

      <div className="mb-4">
        <SaveHint />
      </div>

      {showForm ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Create Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addCourse} className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Input className="md:col-span-2" name="title" placeholder="Course title" required />
              <Input name="category" placeholder="Category" defaultValue="Compliance" />
              <Input name="subcategory" placeholder="Subcategory" defaultValue="General" />
              <Select name="assignedTo" required defaultValue={data.users.find((user) => user.role === "Team Member")?.id}>
                {data.users
                  .filter((user) => user.role === "Team Member" || user.role === "Team Leader")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </Select>
              <Input name="dueDate" type="date" required />
              <Input name="wordCount" type="number" placeholder="Expected words" />
              <Input name="resources" type="number" placeholder="Resources" />
              <Button className="md:col-span-1" type="submit">
                <CalendarPlus className="h-4 w-4" />
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course title, category, assignee, status" />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          {["All", ...courseStatuses].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Course</TH>
                <TH>Assigned To</TH>
                <TH>Due</TH>
                <TH>Status</TH>
                <TH>Progress</TH>
                <TH>Words</TH>
                {courseCustomFields.map((field) => (
                  <TH key={field.id}>{field.label}</TH>
                ))}
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {courses.map((course) => {
                const user = data.users.find((item) => item.id === course.assigned_to);
                const courseModules = data.modules.filter((module) => module.course_id === course.id);
                const completed = courseModules.filter((module) => module.status === "Completed").length;
                const progress = courseProgress(course, courseModules.length, completed);
                return (
                  <TR key={course.id}>
                    <TD>
                      <Link className="font-medium text-emerald-700 hover:underline" href={`/courses/${course.id}`}>
                        {course.course_title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {course.category} / {course.subcategory}
                      </div>
                    </TD>
                    <TD>{user?.name}</TD>
                    <TD>{course.due_date}</TD>
                    <TD>
                      <StatusBadge status={course.status} />
                    </TD>
                    <TD className="min-w-32">
                      <Progress value={progress} />
                      <div className="mt-1 text-xs text-muted-foreground">{progress}%</div>
                    </TD>
                    <TD>{formatNumber(course.actual_word_count)}</TD>
                    {courseCustomFields.map((field) => (
                      <TD key={field.id}>
                        <CustomFieldValueInput
                          field={field}
                          value={getCustomFieldValue(data.customFieldValues, field.id, course.id)}
                          onChange={(value) =>
                            setData((current) => ({
                              ...current,
                              customFieldValues: upsertCustomFieldValue(current.customFieldValues, field.id, course.id, value)
                            }))
                          }
                        />
                      </TD>
                    ))}
                    <TD>
                      <div className="flex justify-end gap-2">
                        {course.status === "Assigned" ? (
                          <Button size="sm" variant="outline" onClick={() => startCourse(course.id)}>
                            Start
                          </Button>
                        ) : null}
                        {course.status !== "Completed" ? (
                          <Button size="sm" onClick={() => completeCourse(course.id)}>
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </TD>
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
