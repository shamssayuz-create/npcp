insert into public.users (id, name, email, role, team_name, invitation_status, invited_at, joined_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Shams Rahman', 'shams@team.local', 'Super Admin', 'Leadership', 'Active', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'Maliha Khan', 'maliha@team.local', 'Manager', 'Operations', 'Active', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'Dipa Akter', 'dipa@team.local', 'Team Leader', 'Compliance', 'Active', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'Shiplu Ahmed', 'shiplu@team.local', 'Team Leader', 'Global', 'Active', now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'Kaif Hasan', 'kaif@team.local', 'Team Member', 'Healthcare', 'Active', now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'Rafid Islam', 'rafid@team.local', 'Team Member', 'Business', 'Active', now(), now())
on conflict (email) do nothing;

insert into public.courses (
  course_title, category, subcategory, assigned_to, assigned_by, assigned_date, due_date,
  status, target_word_count, actual_word_count, resource_count, completion_date
)
values
  ('Health & Social Care Training for NHS Staff', 'Healthcare Management', 'Care', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-06-01', '2026-06-09', 'In Progress', 36000, 34141, 59, null),
  ('Digital Marketing for Retail & E-commerce Businesses', 'Business & Management', 'Sales', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '2026-06-01', '2026-06-06', 'Completed', 48000, 48712, 32, '2026-06-06'),
  ('Safeguarding & Child Protection in Schools', 'Healthcare Management', 'Safeguarding', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '2026-06-02', '2026-06-07', 'Completed', 56000, 59451, 77, '2026-06-07');

insert into public.custom_field_definitions (id, scope, label, type, options)
values
  ('10000000-0000-0000-0000-000000000001', 'courses', 'Priority', 'Select', array['High', 'Medium', 'Low']),
  ('10000000-0000-0000-0000-000000000002', 'courses', 'Owner Note', 'Text', '{}'),
  ('10000000-0000-0000-0000-000000000003', 'reports', 'Prepared By', 'Text', '{}'),
  ('10000000-0000-0000-0000-000000000004', 'reports', 'Approval Status', 'Select', array['Draft', 'Ready', 'Approved'])
on conflict (id) do nothing;
