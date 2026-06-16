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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_24%)]" />
      <div className="relative w-full max-w-md space-y-6">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold">{siteConfig.name}</p>
            <p className="text-xs text-muted-foreground">{siteConfig.tagline}</p>
          </div>
        </Link>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
