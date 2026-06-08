# NPCP Deployment Guide

NPCP means New Production Command Post.

## 1. Open the project on another PC

Unzip the package, then open a terminal in the unzipped `npcp` folder.

## 2. Install Node.js and pnpm

Install Node.js 20 or newer.

Enable pnpm:

```bash
corepack enable
corepack prepare pnpm@11.5.2 --activate
```

If Corepack is unavailable:

```bash
npm install -g pnpm@11.5.2
```

## 3. Install dependencies

```bash
pnpm install
```

## 4. Run locally

```bash
cp .env.example .env.local
pnpm dev
```

Open:

```text
http://127.0.0.1:3000
```

## 5. Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Go to Storage.
6. Create a bucket named `course-files`.
7. Copy your Supabase URL, anon key, and service role key.

Use these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEMO_MODE=true
```

Keep `NEXT_PUBLIC_DEMO_MODE=true` for preview deployment. Switch to `false` only after full Supabase CRUD/auth wiring is completed.

## 6. GitHub upload

Create an empty GitHub repository, then from the project folder:

```bash
git init
git add .
git commit -m "Initial NPCP app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/npcp.git
git push -u origin main
```

## 7. Vercel deployment

1. Go to Vercel.
2. Add New Project.
3. Import the GitHub repository.
4. Let Vercel auto-detect Next.js.
5. Add the environment variables from step 5.
6. Deploy.

Expected commands:

```bash
pnpm install
pnpm build
```

## 8. Final checks after deployment

Open these routes:

```text
/dashboard
/courses
/reports
/users
/settings
```

Confirm:

- NPCP branding is visible.
- Theme is green based.
- Users can be invited by email.
- Courses and Reports custom fields are editable.
- Supabase storage bucket is named `course-files`.
