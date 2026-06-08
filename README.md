# NPCP

NPCP, New Production Command Post, is a Next.js 15 internal app for course production task management, live productivity dashboards, and automatic reporting from course, module, and activity records.

## What is included

- Task management for creating, assigning, starting, and completing courses.
- Module completion tracking with activity logs.
- Dashboard analytics for managers, team leaders, team members, and super admins.
- Daily, weekly, and monthly reporting views generated from production records.
- Global course search and advanced report filters.
- User management with role and team assignment.
- Email invitation workflow for team members, with Supabase invite support ready for production credentials.
- Custom fields for Courses and Reports, including editable definitions and values.
- Notification data model and bell UI.
- DOCX/PDF upload endpoint with DOCX word-count extraction and manual override fallback.
- Supabase schema, seed data, RLS starter policies, and storage-ready upload code.

## Local setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Keep `NEXT_PUBLIC_DEMO_MODE=true` for the built-in sample data.
4. Run the development server.

## Current deployment mode

The app is ready to deploy as a hosted demo/internal preview with `NEXT_PUBLIC_DEMO_MODE=true`.

Supabase schema, storage upload support, and server/client helpers are included, but the main Courses and Reports screens currently use seeded browser-session data for fast previewing. Before switching `NEXT_PUBLIC_DEMO_MODE=false` for production operations, connect the Courses, Reports, Users, and Auth flows to Supabase CRUD and Supabase Auth.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for starter records.
4. Create a storage bucket named `course-files`.
5. Add these variables to `.env.local` and Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_DEMO_MODE=true` for preview deployment
   - `NEXT_PUBLIC_DEMO_MODE=false` only after Supabase Auth and CRUD are fully wired

## Vercel deployment

1. Import the repository into Vercel.
2. Add the Supabase environment variables.
3. Deploy using the default Next.js framework preset.
4. Confirm the upload route can access the `course-files` bucket.

## Reporting design

Reports are not stored as duplicate reporting rows. They are calculated from:

- `courses`
- `modules`
- `activity_logs`

This keeps completion, word count, team productivity, and trend reporting tied directly to task activity.
