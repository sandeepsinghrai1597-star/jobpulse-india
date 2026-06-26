import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Cloud,
  Code,
  CreditCard,
  Database,
  FileSearch,
  Film,
  GraduationCap,
  Landmark,
  Layers,
  MessageCircle,
  MessageSquareText,
  Music,
  Package,
  Palette,
  Search,
  Send,
  Sparkles,
  Square,
  Target,
  Zap,
} from "lucide-react";
import { jobCategories, testimonials } from "@/lib/data/site";
import type { Job } from "@/types";
import { JobCard } from "@/components/jobs/job-card";
import { HeroSection } from "@/components/marketing/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const toolCards = [
  {
    icon: FileSearch,
    title: "Resume Analyzer",
    description: "ATS score, missing keywords, and recruiter-style improvements.",
    href: "/resume-analyzer",
  },
  {
    icon: Sparkles,
    title: "Resume Builder",
    description: "Build clean, role-ready resumes for fresher and experienced jobs.",
    href: "/resume-builder",
  },
  {
    icon: MessageSquareText,
    title: "Interview Prep",
    description: "Practice HR, technical, behavioral, and fresher interview answers.",
    href: "/interview-preparation",
  },
];

const marqueeLogos = [
  { name: "Spotify", icon: Music, accent: "text-emerald-600" },
  { name: "Netflix", icon: Film, accent: "text-rose-600" },
  { name: "Amazon", icon: Package, accent: "text-amber-600" },
  { name: "Google", icon: Search, accent: "text-slate-900" },
  { name: "Reddit", icon: MessageCircle, accent: "text-orange-500" },
  { name: "GitHub", icon: Code, accent: "text-slate-800" },
  { name: "Slack", icon: Send, accent: "text-purple-600" },
  { name: "Figma", icon: Square, accent: "text-indigo-600" },
  { name: "Stripe", icon: CreditCard, accent: "text-blue-600" },
  { name: "Discord", icon: Cloud, accent: "text-indigo-500" },
  { name: "Zapier", icon: Zap, accent: "text-orange-600" },
  { name: "GitLab", icon: Code, accent: "text-orange-700" },
  { name: "Notion", icon: Palette, accent: "text-slate-950" },
  { name: "HashiCorp", icon: Building2, accent: "text-slate-700" },
  { name: "Intercom", icon: MessageCircle, accent: "text-blue-500" },
  { name: "InVision", icon: Layers, accent: "text-pink-600" },
  { name: "ConvertKit", icon: Database, accent: "text-cyan-600" },
  { name: "Buffer", icon: Zap, accent: "text-slate-600" },
  { name: "Automattic", icon: Code, accent: "text-blue-900" },
  { name: "Calendly", icon: BriefcaseBusiness, accent: "text-slate-700" },
  { name: "Typeform", icon: Send, accent: "text-lime-600" },
  { name: "Miro", icon: Palette, accent: "text-yellow-600" },
];

const quickSearches = [
  { label: "Remote jobs", href: "/remote-jobs", icon: Search },
  { label: "Fresher jobs", href: "/fresher-jobs", icon: GraduationCap },
  { label: "Government jobs", href: "/government-jobs", icon: Landmark },
  { label: "Internships", href: "/internships", icon: Target },
];

interface HomePageStats {
  activeJobs: number;
  companies: number;
  cities: number;
}

export function HomePage({
  latestJobs = [],
  heroStats,
}: {
  latestJobs?: Job[];
  heroStats: HomePageStats;
}) {
  return (
    <div className="pb-16">
      <HeroSection stats={heroStats} />

      <section className="w-full py-14">
        <div className="px-8 lg:px-12">
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Companies Known for Remote-Friendly Hiring
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              These companies are globally recognized for remote work cultures. Check their official careers pages for current openings.
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/8 bg-white/4 p-6 shadow-[0_30px_80px_-35px_rgba(255,45,120,0.18)]">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0d0b17] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0d0b17] to-transparent" />

            <div className="group overflow-hidden">
              <div className="marquee-track flex w-max items-center gap-6 px-4 py-4 animate-[marquee_24s_linear_infinite] transition-all duration-300 group-hover:[animation-play-state:paused]">
                {[...marqueeLogos, ...marqueeLogos].map((logo, index) => {
                  const LogoIcon = logo.icon;
                  return (
                    <div
                      key={`${logo.name}-${index}`}
                      className="flex min-w-[160px] items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-6 py-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <LogoIcon className={`h-6 w-6 ${logo.accent}`} />
                      <span className={`text-base font-semibold ${logo.accent}`}>{logo.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Fast paths</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Start with the job type you need.</h2>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-sky-300 hover:text-white">
              Browse all jobs
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickSearches.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-16 items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:border-cyan-300 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3 font-semibold text-white">
                    <Icon className="size-5 text-primary" />
                    {item.label}
                  </span>
                  <ArrowRight className="size-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Explore</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Popular categories</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {jobCategories.map((category) => (
              <Badge key={category} variant="secondary" className="rounded-md border border-white/10 bg-white/6 px-3 py-1 text-slate-200 shadow-sm">
                {category}
              </Badge>
            ))}
          </div>
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/jobs">See all jobs</Link>
          </Button>
        </aside>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Latest jobs</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">
                Fresh opportunities for this week
              </h2>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-primary">
              View all jobs
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {latestJobs.length > 0 ? (
              latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
                <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/4 p-8 text-center text-sm text-slate-400 md:col-span-2">
                  No active jobs yet. Check back soon or subscribe for alerts.
                </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/8 bg-white/4 p-5 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Career toolkit</p>
              <h2 className="font-heading text-3xl font-semibold text-white">
                More than a job board.
              </h2>
              <p className="text-sm leading-6 text-slate-300">
                The best platforms combine search, resume quality, interview preparation, and a
                dashboard. JobPulse brings those workflows together for candidates and employers.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {toolCards.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5 transition hover:border-primary/40 hover:bg-white/8 hover:shadow-md"
                  >
                    <Icon className="size-5 text-primary" />
                    <p className="mt-4 font-semibold text-white">{tool.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[1.75rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,45,120,0.14),rgba(12,11,22,0.94)_55%,rgba(0,255,204,0.05))] p-6 text-white shadow-xl shadow-slate-300/10 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <Building2 className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">For employers</span>
            </div>
            <h2 className="font-heading text-3xl font-semibold">Hire faster with verified candidate workflows.</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Post roles, review applicants, track shortlists, and monitor hiring performance from a
              focused employer dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-lg bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/employer/jobs/new">
                Post a job
                <BriefcaseBusiness className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-white/30 text-white hover:bg-white/10">
              <Link href="/pricing">View plans</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Save jobs and build a focused shortlist",
            "Track every application status from applied to offered",
            "Use AI tools only where they make the workflow faster",
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
              <p className="text-sm font-medium leading-6 text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">What candidates say</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Trusted by job seekers across India</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-6 shadow-sm">
              <p className="text-sm leading-6 text-slate-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
