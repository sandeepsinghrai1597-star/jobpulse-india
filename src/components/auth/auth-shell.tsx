import type { ReactNode } from "react";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { siteConfig } from "@/lib/data/site";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      {/* Premium background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-100 opacity-20 blur-3xl" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_35px,rgba(15,23,42,0.01)_35px,rgba(15,23,42,0.01)_70px)]" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <Link
          href="/"
          className="group mx-auto flex w-fit items-center gap-3 transition-transform hover:scale-105"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/35 transition-all">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold tracking-tight text-slate-900">
              {siteConfig.name}
            </p>
            <p className="text-xs font-medium tracking-wide text-slate-500">
              {siteConfig.tagline}
            </p>
          </div>
        </Link>

        {/* Premium Auth Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
