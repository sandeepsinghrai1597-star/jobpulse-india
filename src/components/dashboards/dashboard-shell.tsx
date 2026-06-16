import type { ReactNode } from "react";
import Link from "next/link";
import { dashboardMetrics } from "@/lib/data/site";
import type { UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

const navigation: Record<UserRole, Array<{ href: string; label: string }>> = {
  candidate: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/resumes", label: "Resumes" },
    { href: "/dashboard/applications", label: "Applications" },
    { href: "/dashboard/interviews", label: "Interviews" },
    { href: "/dashboard/roadmap", label: "Roadmap" },
  ],
  employer: [
    { href: "/employer", label: "Overview" },
    { href: "/employer/jobs", label: "Jobs" },
    { href: "/employer/applicants", label: "Applicants" },
    { href: "/employer/analytics", label: "Analytics" },
  ],
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/seo", label: "SEO" },
    { href: "/admin/payments", label: "Payments" },
  ],
};

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
  return (
    <div className="bg-transparent">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
          <p className="px-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {role} dashboard
          </p>
          <nav className="space-y-1">
            {navigation[role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-3xl text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics[role].map((metric) => (
              <Card key={metric.label} className="rounded-3xl border-white/10 bg-slate-950/70 backdrop-blur">
                <CardContent className="space-y-2 p-5">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="text-sm font-medium text-emerald-600">{metric.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
