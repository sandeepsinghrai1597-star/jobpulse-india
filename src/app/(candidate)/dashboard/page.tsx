import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Heart,
  MessageCircle,
  Pencil,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { getJobInteractionState } from "@/lib/jobs/interactions";
import { dbRowToJob, type SupabaseJobRow } from "@/lib/jobs/live";
import { getDiscoveredJobsForCandidate } from "@/lib/candidate/matching";
import {
  calculateProfileCompletion,
  getEmptyCandidateProfile,
  mapCandidateProfileRow,
} from "@/lib/candidate/profile";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = buildMetadata({
  title: "Candidate Dashboard",
  description: "Track resumes, applications, saved jobs, interviews, and AI recommendations.",
  path: "/dashboard",
});

const profileSelect = `
  id,
  user_id,
  full_name,
  phone,
  headline,
  bio,
  education,
  skills,
  experience,
  city,
  state,
  preferred_roles,
  expected_salary,
  preferred_job_types,
  language_preference,
  resume_url,
  verified,
  verification_status,
  verification_requested_at,
  verified_at,
  updated_at
`;

const jobSelect = `
  id,
  slug,
  category_slug,
  title,
  company_name,
  description,
  responsibilities,
  requirements,
  skills,
  salary_min,
  salary_max,
  salary_type,
  city,
  state,
  country,
  job_type,
  work_mode,
  education_required,
  experience_required,
  industry,
  status,
  application_url,
  deadline,
  source_type,
  source_url,
  created_at,
  updated_at
`;

const applicationStatuses = [
  "applied",
  "viewed",
  "shortlisted",
  "interview",
  "rejected",
  "offered",
] as const;

const statusStyles: Record<(typeof applicationStatuses)[number], string> = {
  applied: "border-sky-200 bg-sky-50 text-sky-700",
  viewed: "border-violet-200 bg-violet-50 text-violet-700",
  shortlisted: "border-amber-200 bg-amber-50 text-amber-700",
  interview: "border-cyan-200 bg-cyan-50 text-cyan-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  offered: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

type ApplicationStatus = (typeof applicationStatuses)[number];

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  jobs: {
    slug: string;
    title: string;
    company_name: string;
    city: string | null;
    state: string | null;
  } | null;
};

type ResumeRow = {
  id: string;
  title: string;
  file_url: string | null;
  ats_score: number | null;
  updated_at: string;
};

type ResumeAnalysisRow = {
  score: number | null;
  match_score: number | null;
  missing_keywords: string[];
  created_at: string;
};

type WhatsAppSubscriptionRow = {
  phone_number: string;
  city: string | null;
  category_slug: string | null;
  is_opted_in: boolean;
  status: string;
  updated_at: string;
};

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "Not updated yet";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatLocation(job: Pick<Job, "city" | "state" | "location">) {
  return job.location || [job.city, job.state].filter(Boolean).join(", ") || "India";
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Briefcase;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-44 flex-col items-start justify-center gap-4 rounded-[1.5rem] border border-dashed border-slate-300 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-50 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon: typeof Briefcase;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary">
            <Icon className="size-4" />
          </div>
          <CardTitle className="truncate text-lg text-slate-950">{title}</CardTitle>
        </div>
        {action ? (
          <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-xl">
            <Link href={action.href}>
              {action.label}
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function CompactJobCard({
  job,
  isSaved = false,
  isSignedIn = false,
  showSaveAction = false,
}: {
  job: Job;
  isSaved?: boolean;
  isSignedIn?: boolean;
  showSaveAction?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-slate-300 capitalize">
              {job.workMode}
            </Badge>
            <Badge variant="secondary" className="rounded-full capitalize">
              {job.jobType}
            </Badge>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-950">{job.title}</h3>
            <p className="text-sm text-muted-foreground">
              {job.companyName} - {formatLocation(job)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-full border-slate-300">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {showSaveAction ? (
            <SaveJobButton
              jobIdentifier={job.slug}
              isInitiallySaved={isSaved}
              isSignedIn={isSignedIn}
              loginRedirectTo={`/login?next=/jobs/${job.slug}`}
            />
          ) : null}
          <Button asChild size="sm" className="rounded-xl">
            <Link href={`/jobs/${job.slug}`}>
              Apply
              <Send className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = getEmptyCandidateProfile();
  let savedJobs: Job[] = [];
  let applications: ApplicationRow[] = [];
  let resumes: ResumeRow[] = [];
  let latestAnalysis: ResumeAnalysisRow | null = null;
  let whatsappSubscription: WhatsAppSubscriptionRow | null = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("candidate_profiles")
      .select(profileSelect)
      .eq("user_id", user.id)
      .maybeSingle();

    profile = mapCandidateProfileRow(profileData);

    const [savedJobsResult, resumesResult, analysisResult, whatsappResult] = await Promise.all([
      supabase
        .from("saved_jobs")
        .select(`jobs:job_id (${jobSelect})`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("resumes")
        .select("id, title, file_url, ats_score, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3),
      supabase
        .from("resume_analyses")
        .select("score, match_score, missing_keywords, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("whatsapp_subscriptions")
        .select("phone_number, city, category_slug, is_opted_in, status, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    savedJobs =
      savedJobsResult.data
        ?.map((item) => item.jobs)
        .filter(Boolean)
        .map((job) => dbRowToJob(job as unknown as SupabaseJobRow)) ?? [];

    resumes = (resumesResult.data as ResumeRow[] | null) ?? [];
    latestAnalysis = (analysisResult.data as ResumeAnalysisRow | null) ?? null;
    whatsappSubscription = (whatsappResult.data as WhatsAppSubscriptionRow | null) ?? null;

    if (profile.id) {
      const { data } = await supabase
        .from("applications")
        .select("id, status, applied_at, updated_at, jobs:job_id (slug, title, company_name, city, state)")
        .eq("candidate_id", profile.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      applications = (data as ApplicationRow[] | null) ?? [];
    }
  }

  const allJobs = await searchUnifiedJobs({});
  const discoveredJobs = getDiscoveredJobsForCandidate(profile, allJobs).slice(0, 3);
  const recommendedJobs = discoveredJobs.length > 0 ? discoveredJobs : allJobs.slice(0, 3);
  const recommendedInteractions = await getJobInteractionState(recommendedJobs.map((job) => job.id));
  const completion = calculateProfileCompletion(profile);
  const careerAgentMissingContext = [
    !profile.education ? "education" : "",
    profile.skills.length === 0 ? "skills" : "",
    !profile.city ? "city" : "",
    !profile.experience ? "experience" : "",
    profile.preferredRoles.length === 0 ? "preferred role" : "",
    !profile.expectedSalary ? "salary expectation" : "",
  ].filter(Boolean);
  const resumeScore = resumes[0]?.ats_score ?? latestAnalysis?.score ?? null;
  const applicationsByStatus = applicationStatuses.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status).length,
  }));

  return (
    <DashboardShell
      role="candidate"
      title="Candidate dashboard"
      description="Manage profile strength, resumes, applications, saved jobs, alerts, and AI career tools from one place."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <SectionCard
            title="Profile completion"
            icon={CheckCircle2}
            action={{ href: "/dashboard/profile", label: "Edit profile" }}
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Profile strength</span>
                    <span className="font-semibold text-slate-950">{completion}%</span>
                  </div>
                  <Progress value={completion} className="h-2.5 rounded-full" />
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <p className="rounded-2xl bg-slate-50 p-3.5 text-muted-foreground">
                    Name <span className="block font-medium text-slate-800">{profile.fullName || "Add full name"}</span>
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-3.5 text-muted-foreground">
                    Location <span className="block font-medium text-slate-800">{[profile.city, profile.state].filter(Boolean).join(", ") || "Add location"}</span>
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-3.5 text-muted-foreground">
                    Skills <span className="block font-medium text-slate-800">{profile.skills.slice(0, 4).join(", ") || "Add skills"}</span>
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-3.5 text-muted-foreground">
                    Verification <span className="block font-medium text-slate-800">{titleCase(profile.verificationStatus)}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-sky-100 bg-[linear-gradient(180deg,#f9fcff_0%,#f4f9ff_100%)] p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Next best action</p>
                  <p className="font-semibold text-slate-950">
                    {profile.resumeUrl ? "Keep your profile fresh" : "Upload a resume"}
                  </p>
                </div>
                <Button asChild className="rounded-xl">
                  <Link href="/dashboard/profile">
                    <Pencil className="size-4" />
                    Edit profile
                  </Link>
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Recommended jobs"
            icon={Sparkles}
            action={{ href: "/jobs", label: "Browse jobs" }}
          >
            {recommendedJobs.length > 0 ? (
              <div className="grid gap-3">
                {recommendedJobs.map((job) => (
                  <CompactJobCard
                    key={job.id}
                    job={job}
                    showSaveAction
                    isSaved={recommendedInteractions.stateByJobId.get(job.id)?.isSaved ?? false}
                    isSignedIn={recommendedInteractions.isSignedIn}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No recommendations yet"
                description="Add your city, skills, and preferred roles to unlock sharper matches."
                action={{ href: "/dashboard/profile", label: "Update profile" }}
              />
            )}
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Saved jobs"
              icon={Heart}
              action={{ href: "/dashboard/saved-jobs", label: "View all" }}
            >
              {savedJobs.length > 0 ? (
                <div className="space-y-3">
                  {savedJobs.map((job) => (
                    <CompactJobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No saved jobs"
                  description="Save roles from recommendations or job search to build a focused shortlist."
                  action={{ href: "/jobs", label: "Find jobs" }}
                />
              )}
            </SectionCard>

            <SectionCard
              title="Applied jobs"
              icon={ClipboardList}
              action={{ href: "/dashboard/applications", label: "Track all" }}
            >
              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((application) => (
                    <Link
                      key={application.id}
                      href={application.jobs?.slug ? `/jobs/${application.jobs.slug}` : "/dashboard/applications"}
                      className="block rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate font-medium text-slate-950">
                            {application.jobs?.title ?? "Job unavailable"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {application.jobs?.company_name ?? "Unknown company"}
                          </p>
                        </div>
                        <Badge className={statusStyles[application.status]}>
                          {titleCase(application.status)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="No applications yet"
                  description="Apply to matched jobs and your status timeline will appear here."
                  action={{ href: "/jobs", label: "Start applying" }}
                />
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Application status"
            icon={CalendarCheck}
            action={{ href: "/dashboard/applications", label: "Open tracker" }}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {applicationsByStatus.map(({ status, count }) => (
                <div key={status} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-slate-950">{count}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-600">{titleCase(status)}</p>
                    <Badge className={cn("rounded-full", statusStyles[status])}>{count === 1 ? "1 role" : `${count} roles`}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Resume"
            icon={FileText}
            action={{ href: "/dashboard/resumes", label: "Manage" }}
          >
            {resumes.length > 0 || profile.resumeUrl ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-950">
                        {resumes[0]?.title ?? "Profile resume"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Updated {formatDate(resumes[0]?.updated_at ?? profile.updatedAt)}
                      </p>
                    </div>
                    <Badge variant={resumeScore ? "default" : "outline"} className="rounded-full">
                      {resumeScore ? `${resumeScore}/100` : "Not scored"}
                    </Badge>
                  </div>
                </div>
                <Button asChild className="w-full rounded-xl">
                  <Link href="/resume-analyzer">
                    <Sparkles className="size-4" />
                    View resume score
                  </Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={Upload}
                title="No resume uploaded"
                description="Upload or build a resume, then analyze it for ATS and recruiter readiness."
                action={{ href: "/dashboard/resumes", label: "Upload resume" }}
              />
            )}
          </SectionCard>

          <SectionCard title="AI career assistant" icon={Bot}>
            <p className="text-sm leading-6 text-muted-foreground">
              Get role suggestions, verified job matches, skill gaps, salary guidance, and a 7-day action plan.
            </p>
            <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
              <p className="text-sm font-medium text-slate-950">
                {careerAgentMissingContext.length > 0 ? "Missing context" : "Ready for AI guidance"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {careerAgentMissingContext.length > 0
                  ? careerAgentMissingContext.join(", ")
                  : "Your profile has the required career-agent context."}
              </p>
            </div>
            <Button asChild className="w-full rounded-xl">
              <Link href="/ai-career-agent">
                <Bot className="size-4" />
                Open assistant
              </Link>
            </Button>
          </SectionCard>

          <SectionCard title="Interview prep" icon={MessageCircle}>
            <p className="text-sm leading-6 text-muted-foreground">
              Practice role-specific questions and review your answers before shortlisted interviews.
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/dashboard/interviews">
                <MessageCircle className="size-4" />
                Start practice
              </Link>
            </Button>
          </SectionCard>

          <SectionCard title="WhatsApp alerts" icon={Bell}>
            <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">
                    {whatsappSubscription?.is_opted_in ? "Alerts enabled" : "Alerts not enabled"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {whatsappSubscription?.phone_number ?? profile.phone ?? "Add a phone number"}
                  </p>
                </div>
                <Badge variant={whatsappSubscription?.is_opted_in ? "default" : "outline"} className="rounded-full">
                  {whatsappSubscription?.status ? titleCase(whatsappSubscription.status) : "Off"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {whatsappSubscription?.city
                  ? `Job alerts for ${whatsappSubscription.city}`
                  : "Choose city and category preferences to receive matching jobs."}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/dashboard/profile">
                <Bell className="size-4" />
                Manage alerts
              </Link>
            </Button>
          </SectionCard>

          <SectionCard
            title="Learning roadmap"
            icon={BookOpen}
            action={{ href: "/dashboard/roadmap", label: "View" }}
          >
            <div className="space-y-3">
              {[
                "Refresh resume keywords",
                "Close top skill gap",
                "Practice interview answers",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-[1.25rem] bg-slate-50 p-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Subscription" icon={Briefcase}>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#dffaf0_100%)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-emerald-900">Free candidate plan</p>
                  <p className="text-sm leading-6 text-emerald-800">
                    Job search, saved jobs, applications, and core AI tools are active.
                  </p>
                </div>
                <Badge className="rounded-full bg-emerald-600 text-white">Active</Badge>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}

