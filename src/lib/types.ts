export type Role = "Super Admin" | "Manager" | "Team Leader" | "Team Member";

export type CourseStatus =
  | "Assigned"
  | "In Progress"
  | "Review"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export type ModuleStatus = "Pending" | "In Progress" | "Completed";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  team_name: string;
  invitation_status: "Invited" | "Active";
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  course_title: string;
  category: string;
  subcategory: string;
  assigned_to: string;
  assigned_by: string;
  assigned_date: string;
  due_date: string;
  status: CourseStatus;
  target_word_count: number;
  actual_word_count: number;
  resource_count: number;
  completion_date: string | null;
  uploaded_file_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  module_number: number;
  module_title: string;
  word_count: number;
  status: ModuleStatus;
  completed_date: string | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  course_id: string;
  action:
    | "Course Assigned"
    | "Course Started"
    | "Module Completed"
    | "Course Completed"
    | "Course Reassigned"
    | "File Uploaded"
    | "Manual Word Count Override";
  details: Record<string, unknown>;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  course_id?: string;
  read_at: string | null;
  created_at: string;
};

export type CustomFieldScope = "courses" | "reports";

export type CustomFieldType = "Text" | "Number" | "Date" | "Select";

export type CustomFieldDefinition = {
  id: string;
  scope: CustomFieldScope;
  label: string;
  type: CustomFieldType;
  options?: string[];
  created_at: string;
};

export type CustomFieldValue = {
  id: string;
  field_id: string;
  entity_id: string;
  value: string;
  updated_at: string;
};

export type DateRange = {
  from: string;
  to: string;
};

export type ReportFilters = {
  range: DateRange;
  team?: string;
  userId?: string;
  category?: string;
  subcategory?: string;
  status?: CourseStatus | "All";
};

export type AppData = {
  users: User[];
  courses: Course[];
  modules: CourseModule[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  customFields: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
};
