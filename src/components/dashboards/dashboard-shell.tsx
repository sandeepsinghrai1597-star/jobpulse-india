"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { dashboardMetrics } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const navigation: Record<UserRole, NavigationItem[]> = {
  candidate: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
    { href: "/dashboard/resumes", label: "Resumes", icon: FileText },
    { href: "/dashboard/applications", label: "Applications", icon: BriefcaseBusiness },
    { href: "/dashboard/interviews", label: "Interviews", icon: Sparkles },
    { href: "/dashboard/roadmap", label: "Roadmap", icon: BarChart3 },
  ],
  employer: [
    { href: "/employer", label: "Overview", icon: LayoutDashboard },
    { href: "/employer/profile", label: "Company profile", icon: Building2 },
    { href: "/employer/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { href: "/employer/applicants", label: "Applicants", icon: UsersRound },
    { href: "/employer/analytics", label: "Analytics", icon: BarChart3 },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { href: "/admin/job-sources", label: "Sources", icon: Building2 },
    { href: "/admin/jobs/fetched", label: "Fetched Jobs", icon: FileText },
    { href: "/admin/users", label: "Users", icon: UsersRound },
    { href: "/admin/seo", label: "SEO", icon: Search },
    { href: "/admin/payments", label: "Payments", icon: ShieldCheck },
  ],
};

const globalNavigation: NavigationItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/jobs", label: "Browse jobs", icon: Search },
  { href: "/pricing", label: "Pricing", icon: Sparkles },
];

const roleResources: Record<UserRole, NavigationItem[]> = {
  candidate: [
    { href: "/resume-builder", label: "Resume builder", icon: FileText },
    { href: "/resume-analyzer", label: "Resume analyzer", icon: ShieldCheck },
    { href: "/ai-career-agent", label: "AI career agent", icon: Sparkles },
  ],
  employer: [
    { href: "/employer/jobs/new", label: "Post a job", icon: BriefcaseBusiness },
    { href: "/pricing", label: "Employer plans", icon: Sparkles },
    { href: "/contact", label: "Contact support", icon: Settings },
  ],
  admin: [
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/government-jobs", label: "Govt jobs", icon: BriefcaseBusiness },
    { href: "/admin/internships", label: "Internships", icon: UsersRound },
    { href: "/admin/jobs/import", label: "CSV import", icon: ArrowUpRight },
  ],
};

const metricStyles: Record<UserRole, string[]> = {
  candidate: [
    "from-sky-500/15 to-cyan-500/10 text-sky-700",
    "from-violet-500/15 to-fuchsia-500/10 text-violet-700",
    "from-emerald-500/15 to-teal-500/10 text-emerald-700",
    "from-amber-500/15 to-orange-500/10 text-amber-700",
  ],
  employer: [],
  admin: [
    "from-sky-500/15 to-cyan-500/10 text-sky-700",
    "from-violet-500/15 to-fuchsia-500/10 text-violet-700",
    "from-emerald-500/15 to-teal-500/10 text-emerald-700",
    "from-amber-500/15 to-orange-500/10 text-amber-700",
  ],
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  role,
  title,
  description,
  children,
}: {
  role: UserRole;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const primaryCtaHref =
    role === "candidate" ? "/jobs" : role === "employer" ? "/employer/jobs/new" : "/admin/jobs";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,#f7fbff_0%,#ffffff_46%,#f8fafc_100%)] text-slate-950">
      <div className="border-b border-white/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-sky-500/25">
              JP
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.26em] text-sky-800">
                JobPulse India
              </span>
              <span className="block text-sm text-slate-500">{roleLabel} workspace</span>
            </span>
          </Link>
          <nav
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-sm"
            aria-label="Dashboard top navigation"
          >
            {globalNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/auth/logout"
              className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="size-4" />
              Logout
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[290px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(37,99,235,0.08)_45%,rgba(255,255,255,0.9)_100%)] p-5">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-800">
                  {roleLabel} dashboard
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Navigate workspace tools, jump into AI actions, and keep your weekly career workflow tight.
                </p>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <nav className="space-y-1.5" aria-label={`${roleLabel} dashboard navigation`}>
                {navigation[role].map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition",
                        active
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl",
                            active ? "bg-white/14 text-white" : "bg-sky-50 text-sky-700",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        {item.label}
                      </span>
                      {active ? <span className="size-2 rounded-full bg-cyan-300" /> : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Quick links
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                    Tools
                  </span>
                </div>
                <nav className="mt-3 space-y-1.5" aria-label={`${roleLabel} quick links`}>
                  {roleResources[role].map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Icon className="size-4" />
                          </span>
                          {item.label}
                        </span>
                        <ArrowUpRight className="size-4 text-slate-400" />
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="flex flex-col gap-5 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(37,99,235,0.05)_50%,rgba(255,255,255,0.96)_100%)] p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-800">
                  Workspace overview
                </p>
                <div className="space-y-2">
                  <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {title}
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                    {description}
                  </p>
                </div>
              </div>
              <Link
                href={primaryCtaHref}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Sparkles className="size-4" />
                {role === "candidate" ? "Find jobs" : role === "employer" ? "Post job" : "Review jobs"}
              </Link>
            </div>
          </div>

          {role !== "employer" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardMetrics[role].map((metric, index) => (
                <Card
                  key={metric.label}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <CardContent className="space-y-4 p-5">
                    <div
                      className={cn(
                        "inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                        metricStyles[role][index] ?? "from-slate-200 to-slate-100 text-slate-700",
                      )}
                    >
                      {metric.label}
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-semibold tracking-tight text-slate-950">
                        {metric.value}
                      </p>
                      <p className="text-sm font-medium text-slate-600">{metric.change}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
