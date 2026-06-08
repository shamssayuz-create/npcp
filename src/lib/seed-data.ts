import type { AppData, ActivityLog, Course, CourseModule, CustomFieldDefinition, CustomFieldValue, Notification, User } from "@/lib/types";

const now = "2026-06-08T10:00:00.000Z";

export const users: User[] = [
  { id: "u-admin", name: "Shams Rahman", email: "shams@team.local", role: "Super Admin", team_name: "Leadership", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-manager", name: "Maliha Khan", email: "maliha@team.local", role: "Manager", team_name: "Operations", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-lead-a", name: "Dipa Akter", email: "dipa@team.local", role: "Team Leader", team_name: "Compliance", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-lead-b", name: "Shiplu Ahmed", email: "shiplu@team.local", role: "Team Leader", team_name: "Global", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-kaif", name: "Kaif Hasan", email: "kaif@team.local", role: "Team Member", team_name: "Healthcare", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-rafid", name: "Rafid Islam", email: "rafid@team.local", role: "Team Member", team_name: "Business", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-mahjabin", name: "Mahjabin Sultana", email: "mahjabin@team.local", role: "Team Member", team_name: "Compliance", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-nazifa", name: "Nazifa Noor", email: "nazifa@team.local", role: "Team Member", team_name: "Global", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-sayma", name: "Sayma Rahman", email: "sayma@team.local", role: "Team Member", team_name: "Global", invitation_status: "Active", invited_at: now, joined_at: now, created_at: now },
  { id: "u-sraboni", name: "Sraboni Akter", email: "sraboni@team.local", role: "Team Member", team_name: "Technology", invitation_status: "Invited", invited_at: now, joined_at: null, created_at: now }
];

const courseRows = [
  ["c-001", "Health & Social Care Training for NHS Staff", "Healthcare Management", "Care", "u-kaif", "2026-06-01", "2026-06-09", "In Progress", 36000, 34141, 59, null],
  ["c-002", "Digital Marketing for Retail & E-commerce Businesses", "Business & Management", "Sales", "u-rafid", "2026-06-01", "2026-06-06", "Completed", 48000, 48712, 32, "2026-06-06"],
  ["c-003", "Safeguarding & Child Protection in Schools", "Healthcare Management", "Safeguarding", "u-lead-a", "2026-06-02", "2026-06-07", "Completed", 56000, 59451, 77, "2026-06-07"],
  ["c-004", "Cybersecurity Awareness for Office Staff", "Technology & Data", "Cybersecurity", "u-sraboni", "2026-06-02", "2026-06-08", "Review", 45000, 44980, 29, null],
  ["c-005", "Workplace Cybersecurity Awareness Training", "Project Compliance", "US", "u-sayma", "2026-06-03", "2026-06-08", "Completed", 30000, 30176, 22, "2026-06-08"],
  ["c-006", "HIPAA Privacy & Security", "Project Compliance", "US", "u-mahjabin", "2026-06-03", "2026-06-09", "In Progress", 28000, 26374, 50, null],
  ["c-007", "Anti Money Laundering For Bank Tellers And Branch Staff", "AML", "USA", "u-lead-b", "2026-06-04", "2026-06-10", "Assigned", 42000, 0, 0, null],
  ["c-008", "AML And KYC Basics For New Bankers", "AML", "USA", "u-nazifa", "2026-06-04", "2026-06-07", "Completed", 40000, 42126, 51, "2026-06-07"],
  ["c-009", "Sexual Harassment Prevention", "Project Compliance", "US", "u-mahjabin", "2026-06-05", "2026-06-08", "Completed", 42000, 42713, 58, "2026-06-08"],
  ["c-010", "FCPA Essentials For US Businesses", "Anti Bribery", "USA", "u-rafid", "2026-06-05", "2026-06-11", "On Hold", 37000, 12240, 10, null],
  ["c-011", "GDPR Training for Finance Professionals", "Compliance", "Data Protection", "u-sayma", "2026-06-06", "2026-06-12", "In Progress", 47000, 22880, 15, null],
  ["c-012", "Manual Handling Training for Healthcare & Construction Staff", "Compliance", "Health & Safety", "u-kaif", "2026-06-06", "2026-06-08", "Assigned", 52000, 0, 0, null]
] as const;

export const courses: Course[] = courseRows.map((row) => ({
  id: row[0],
  course_title: row[1],
  category: row[2],
  subcategory: row[3],
  assigned_to: row[4],
  assigned_by: "u-manager",
  assigned_date: row[5],
  due_date: row[6],
  status: row[7],
  target_word_count: row[8],
  actual_word_count: row[9],
  resource_count: row[10],
  completion_date: row[11],
  uploaded_file_url: null,
  created_at: `${row[5]}T09:00:00.000Z`,
  updated_at: `${row[6]}T12:00:00.000Z`
}));

export const modules: CourseModule[] = courses.flatMap((course) => {
  const completedCount = course.status === "Completed" ? 5 : course.status === "Assigned" ? 0 : course.status === "Review" ? 4 : 2;
  return Array.from({ length: 5 }, (_, index) => {
    const completed = index < completedCount;
    return {
      id: `${course.id}-m-${index + 1}`,
      course_id: course.id,
      module_number: index + 1,
      module_title: `Module ${index + 1}`,
      word_count: completed ? Math.max(1800, Math.round(course.actual_word_count / Math.max(completedCount, 1))) : 0,
      status: completed ? "Completed" : index === completedCount ? "In Progress" : "Pending",
      completed_date: completed ? course.completion_date ?? course.updated_at.slice(0, 10) : null,
      created_at: course.created_at
    };
  });
});

export const activityLogs: ActivityLog[] = [
  ...courses.map((course) => ({
    id: `log-assigned-${course.id}`,
    user_id: course.assigned_by,
    course_id: course.id,
    action: "Course Assigned" as const,
    details: { assigned_to: course.assigned_to, due_date: course.due_date },
    created_at: `${course.assigned_date}T09:30:00.000Z`
  })),
  ...courses
    .filter((course) => course.status !== "Assigned")
    .map((course) => ({
      id: `log-started-${course.id}`,
      user_id: course.assigned_to,
      course_id: course.id,
      action: "Course Started" as const,
      details: { previous_status: "Assigned" },
      created_at: `${course.assigned_date}T10:15:00.000Z`
    })),
  ...modules
    .filter((module) => module.status === "Completed")
    .map((module) => ({
      id: `log-module-${module.id}`,
      user_id: courses.find((course) => course.id === module.course_id)?.assigned_to ?? "u-manager",
      course_id: module.course_id,
      action: "Module Completed" as const,
      details: { module_id: module.id, module_number: module.module_number, word_count: module.word_count },
      created_at: `${module.completed_date}T15:${String(module.module_number).padStart(2, "0")}:00.000Z`
    })),
  ...courses
    .filter((course) => course.status === "Completed")
    .map((course) => ({
      id: `log-completed-${course.id}`,
      user_id: course.assigned_to,
      course_id: course.id,
      action: "Course Completed" as const,
      details: { word_count: course.actual_word_count, resource_count: course.resource_count },
      created_at: `${course.completion_date}T17:00:00.000Z`
    }))
];

export const notifications: Notification[] = [
  {
    id: "n-001",
    user_id: "u-kaif",
    title: "Course due tomorrow",
    body: "Health & Social Care Training for NHS Staff is due soon.",
    course_id: "c-001",
    read_at: null,
    created_at: "2026-06-08T08:00:00.000Z"
  },
  {
    id: "n-002",
    user_id: "u-manager",
    title: "Course completed",
    body: "Workplace Cybersecurity Awareness Training was completed today.",
    course_id: "c-005",
    read_at: null,
    created_at: "2026-06-08T17:05:00.000Z"
  },
  {
    id: "n-003",
    user_id: "u-mahjabin",
    title: "New course assigned",
    body: "HIPAA Privacy & Security is ready to start.",
    course_id: "c-006",
    read_at: "2026-06-08T09:00:00.000Z",
    created_at: "2026-06-03T09:35:00.000Z"
  }
];

export const customFields: CustomFieldDefinition[] = [
  {
    id: "cf-course-priority",
    scope: "courses",
    label: "Priority",
    type: "Select",
    options: ["High", "Medium", "Low"],
    created_at: now
  },
  {
    id: "cf-course-owner-note",
    scope: "courses",
    label: "Owner Note",
    type: "Text",
    created_at: now
  },
  {
    id: "cf-report-prepared-by",
    scope: "reports",
    label: "Prepared By",
    type: "Text",
    created_at: now
  },
  {
    id: "cf-report-approval-status",
    scope: "reports",
    label: "Approval Status",
    type: "Select",
    options: ["Draft", "Ready", "Approved"],
    created_at: now
  }
];

export const customFieldValues: CustomFieldValue[] = [
  {
    id: "cfv-course-priority-c001",
    field_id: "cf-course-priority",
    entity_id: "c-001",
    value: "High",
    updated_at: now
  },
  {
    id: "cfv-course-note-c001",
    field_id: "cf-course-owner-note",
    entity_id: "c-001",
    value: "Needs final QA",
    updated_at: now
  },
  {
    id: "cfv-report-prepared-by",
    field_id: "cf-report-prepared-by",
    entity_id: "reports",
    value: "Maliha Khan",
    updated_at: now
  },
  {
    id: "cfv-report-approval",
    field_id: "cf-report-approval-status",
    entity_id: "reports",
    value: "Draft",
    updated_at: now
  }
];

export const seedData: AppData = {
  users,
  courses,
  modules,
  activityLogs,
  notifications,
  customFields,
  customFieldValues
};
