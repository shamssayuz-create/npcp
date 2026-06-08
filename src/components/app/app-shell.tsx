"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpenCheck, LayoutDashboard, LineChart, LogOut, Search, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seedData } from "@/lib/seed-data";
import { visibleNavigation } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";

const iconMap = {
  Dashboard: LayoutDashboard,
  Courses: BookOpenCheck,
  Reports: LineChart,
  Users,
  Settings
};

const hrefMap = {
  Dashboard: "/dashboard",
  Courses: "/courses",
  Reports: "/reports",
  Users: "/users",
  Settings: "/settings"
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = seedData.users[0] ?? {
    id: "current-user",
    name: "Admin",
    email: "",
    role: "Super Admin" as const,
    team_name: "Leadership",
    invitation_status: "Active" as const,
    invited_at: null,
    joined_at: null,
    created_at: new Date().toISOString()
  };
  const unread = seedData.notifications.filter((item) => !item.read_at).length;
  const nav = visibleNavigation(currentUser.role);

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">NP</div>
          <div>
            <div className="text-sm font-semibold">NPCP</div>
            <div className="text-xs text-muted-foreground">New Production Command Post</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const Icon = iconMap[item as keyof typeof iconMap];
            const href = hrefMap[item as keyof typeof hrefMap];
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-emerald-50 text-emerald-700"
                )}
                href={href}
              >
                <Icon className="h-4 w-4" />
                {item}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 min-w-0 items-center gap-3 border-b bg-white px-4 lg:px-6">
          <div className="lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">NP</div>
          </div>
          <div className="min-w-0 lg:hidden">
            <div className="truncate text-sm font-semibold">NPCP</div>
            <div className="truncate text-[11px] text-muted-foreground">New Production Command Post</div>
          </div>
          <div className="relative min-w-0 max-w-lg flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search courses, categories, assigned users, status" />
          </div>
          <Button aria-label="Notifications" size="icon" variant="outline">
            <Bell className="h-4 w-4" />
            {unread > 0 ? <span className="absolute mt-[-28px] ml-7 h-2 w-2 rounded-full bg-red-500" /> : null}
          </Button>
          <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-xs font-semibold">{initials(currentUser.name)}</div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium">{currentUser.name}</div>
              <div className="text-[11px] text-muted-foreground">{currentUser.role}</div>
            </div>
          </div>
          <Button aria-label="Sign out" onClick={signOut} size="icon" variant="ghost">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <nav className="sticky top-16 z-10 flex gap-1 overflow-x-auto border-b bg-white px-3 py-2 lg:hidden">
          {nav.map((item) => {
            const Icon = iconMap[item as keyof typeof iconMap];
            const href = hrefMap[item as keyof typeof hrefMap];
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-emerald-50 text-emerald-700"
                )}
                href={href}
              >
                <Icon className="h-4 w-4" />
                {item}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
