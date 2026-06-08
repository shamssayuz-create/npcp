create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('Super Admin', 'Manager', 'Team Leader', 'Team Member')),
  team_name text not null,
  invitation_status text not null check (invitation_status in ('Invited', 'Active')) default 'Invited',
  invited_at timestamp with time zone,
  joined_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  course_title text not null,
  category text not null,
  subcategory text not null,
  assigned_to uuid references public.users(id) on delete set null,
  assigned_by uuid references public.users(id) on delete set null,
  assigned_date date not null default current_date,
  due_date date not null,
  status text not null check (status in ('Assigned', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled')) default 'Assigned',
  target_word_count integer not null default 0,
  actual_word_count integer not null default 0,
  resource_count integer not null default 0,
  completion_date date,
  uploaded_file_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_number integer not null,
  module_title text not null,
  word_count integer not null default 0,
  status text not null check (status in ('Pending', 'In Progress', 'Completed')) default 'Pending',
  completed_date date,
  created_at timestamp with time zone not null default now(),
  unique (course_id, module_number)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  course_id uuid references public.courses(id) on delete cascade,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  course_id uuid references public.courses(id) on delete cascade,
  read_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('courses', 'reports')),
  label text not null,
  type text not null check (type in ('Text', 'Number', 'Date', 'Select')),
  options text[] not null default '{}',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.custom_field_definitions(id) on delete cascade,
  entity_id text not null,
  value text not null default '',
  updated_at timestamp with time zone not null default now(),
  unique (field_id, entity_id)
);

create index if not exists courses_assigned_to_idx on public.courses (assigned_to);
create index if not exists courses_status_idx on public.courses (status);
create index if not exists courses_completion_date_idx on public.courses (completion_date);
create index if not exists modules_course_id_idx on public.modules (course_id);
create index if not exists modules_completed_date_idx on public.modules (completed_date);
create index if not exists activity_logs_course_id_idx on public.activity_logs (course_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at);
create index if not exists custom_field_definitions_scope_idx on public.custom_field_definitions (scope);
create index if not exists custom_field_values_entity_idx on public.custom_field_values (entity_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists courses_touch_updated_at on public.courses;
create trigger courses_touch_updated_at
before update on public.courses
for each row execute function public.touch_updated_at();

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.custom_field_definitions enable row level security;
alter table public.custom_field_values enable row level security;

create or replace view public.daily_reporting as
select
  c.completion_date as report_date,
  count(*) filter (where c.status = 'Completed') as courses_completed,
  coalesce(sum(c.actual_word_count), 0) as total_word_count,
  coalesce(avg(c.actual_word_count), 0) as average_word_count_per_course,
  coalesce(avg(c.completion_date - c.assigned_date + 1), 0) as average_completion_time_days
from public.courses c
where c.completion_date is not null
group by c.completion_date;

create or replace view public.module_reporting as
select
  m.completed_date as report_date,
  c.assigned_to,
  c.category,
  c.subcategory,
  count(*) as modules_completed,
  coalesce(sum(m.word_count), 0) as module_word_count
from public.modules m
join public.courses c on c.id = m.course_id
where m.status = 'Completed' and m.completed_date is not null
group by m.completed_date, c.assigned_to, c.category, c.subcategory;

create policy "authenticated users can read users"
on public.users for select
to authenticated
using (true);

create policy "authenticated users can read courses"
on public.courses for select
to authenticated
using (true);

create policy "managers can write courses"
on public.courses for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can read modules"
on public.modules for select
to authenticated
using (true);

create policy "authenticated users can write modules"
on public.modules for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can read activity"
on public.activity_logs for select
to authenticated
using (true);

create policy "authenticated users can insert activity"
on public.activity_logs for insert
to authenticated
with check (true);

create policy "users can read notifications"
on public.notifications for select
to authenticated
using (true);

create policy "authenticated users can read custom field definitions"
on public.custom_field_definitions for select
to authenticated
using (true);

create policy "authenticated users can manage custom field definitions"
on public.custom_field_definitions for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can read custom field values"
on public.custom_field_values for select
to authenticated
using (true);

create policy "authenticated users can manage custom field values"
on public.custom_field_values for all
to authenticated
using (true)
with check (true);
