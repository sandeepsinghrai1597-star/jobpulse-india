import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { JobViewTracker } from "@/components/analytics/job-view-tracker";
import { JobCard } from "@/components/jobs/job-card";
import { ReportJobButton } from "@/components/jobs/report-job-button";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { VerifiedApplyPanel } from "@/components/jobs/verified-apply-panel";
import { SchemaScript } from "@/components/shared/schema-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getJobInteractionState } from "@/lib/jobs/interactions";
import { getCachedOrComputeJobMatches } from "@/lib/candidate/job-match";
import { mapCandidateProfileRow } from "@/lib/candidate/profile";
import { getUnifiedJob, getSimilarUnifiedJobs } from "@/lib/jobs/search";
import { buildBreadcrumbSchema, buildJobPostingSchema, buildMetadata } from "@/lib/seo";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function buildJobMetaTitle(job: NonNullable<Awaited<ReturnType<typeof getUnifiedJob>>>) {
  return `${job.title} at ${job.companyName} in ${job.location} | Apply Online`;
}

function buildJobMetaDescription(job: NonNullable<Awaited<ReturnType<typeof getUnifiedJob>>>) {
  const parts = [
    `${job.title} job at ${job.companyName} in ${job.location}.`,
    `${formatJobType(job.jobType)} role`,
    `${job.workMode} work mode`,
    job.experienceRequired ? `${job.experienceRequired} experience` : "",
    job.applicationDeadline ? `Apply before ${formatDate(job.applicationDeadline)}.` : "",
  ].filter(Boolean);

  const description = parts.join(" ");
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getUnifiedJob(slug);

  if (!job) {
    return buildMetadata({
      title: "Job not found",
      description: "The requested job could not be found.",
      path: `/jobs/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: buildJobMetaTitle(job),
    absoluteTitle: buildJobMetaTitle(job),
    description: buildJobMetaDescription(job),
    path: `/jobs/${job.slug}`,
    keywords: [job.title, job.city, job.industry, ...job.skills],
    image: `/api/og?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.companyName)}`,
  });
}

export const dynamic = "force-dynamic";

function formatSalary(job: Awaited<ReturnType<typeof getUnifiedJob>>) {
  if (!job) {
    return "Salary not disclosed by employer";
  }

  if (!job.salaryDisclosed || (job.salaryMin <= 0 && job.salaryMax <= 0)) {
    return "Salary not disclosed by employer";
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const minimum = formatter.format(job.salaryMin);
  const maximum = formatter.format(job.salaryMax);

  return `${minimum} - ${maximum} / ${job.salaryType}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(parsed));
}

function formatJobType(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;
  const job = await getUnifiedJob(slug);
  if (!job) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = getSupabaseAdminClient();
  let trustProfile: {
    verifiedEmployer: boolean;
    adminVerified: boolean;
    companyEmailVerified: boolean;
    domainVerificationStatus: string;
  } | null = null;

  if (admin && isUuid(job.id)) {
    const { data } = await admin
      .from("jobs")
      .select(
        "id, employer_profiles!jobs_employer_id_fkey(verified, approval_status, company_email_verified, domain_verification_status)",
      )
      .eq("id", job.id)
      .maybeSingle();

    const employerProfile = (data as {
      employer_profiles?: {
        verified?: boolean | null;
        approval_status?: string | null;
        company_email_verified?: boolean | null;
        domain_verification_status?: string | null;
      } | null;
    } | null)?.employer_profiles;

    if (employerProfile) {
      trustProfile = {
        verifiedEmployer: Boolean(employerProfile.verified),
        adminVerified: employerProfile.approval_status === "approved",
        companyEmailVerified: Boolean(employerProfile.company_email_verified),
        domainVerificationStatus: employerProfile.domain_verification_status ?? "pending",
      };
    }
  }

  const similarJobs = await getSimilarUnifiedJobs(slug);
  const interactions = await getJobInteractionState([job.id, ...similarJobs.map((item) => item.id)]);
  const salaryLabel = formatSalary(job);
  const formattedDeadline = formatDate(job.applicationDeadline);
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${job.title} at ${job.companyName}\n${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/jobs/${job.slug}`,
  )}`;
  const sourceLabel = job.sourceUrl ? "Official/Provided job source" : null;
  const safetySignals = [
    job.noCandidatePayment ? "No candidate payment required" : null,
    trustProfile?.verifiedEmployer ? "Employer profile verified" : null,
    trustProfile?.companyEmailVerified ? "Company email verified" : null,
    job.officialVerified ? "Source verification present" : null,
  ].filter(Boolean) as string[];
  const interactionState = interactions.stateByJobId.get(job.id);
  const profileResult = user
    ? await supabase
        .from("candidate_profiles")
        .select(
          "id, user_id, full_name, phone, headline, bio, education, skills, experience, city, state, preferred_roles, expected_salary, preferred_job_types, language_preference, resume_url, verified, verification_status, verification_requested_at, verified_at, updated_at",
        )
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const candidateProfile = mapCandidateProfileRow(profileResult.data);
  const profileResumeUrl = profileResult.data?.resume_url ?? null;
  const matchSummaries = await getCachedOrComputeJobMatches({
    supabase,
    profile: profileResult.data ? candidateProfile : null,
    jobs: [job, ...similarJobs],
  });
  const currentMatchSummary = matchSummaries.get(job.id) ?? null;
  const resumesResult = user
    ? await supabase
        .from("resumes")
        .select("id, title, file_url, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
    : { data: null };
  const resumeOptions = [
    ...(profileResumeUrl
      ? [
          {
            id: "profile-resume",
            title: "Profile resume",
            fileUrl: profileResumeUrl,
            updatedAt: new Date().toISOString(),
          },
        ]
      : []),
    ...((resumesResult.data ?? []).map((resume) => ({
      id: `resume:${resume.id}`,
      title: resume.title,
      fileUrl: resume.file_url,
      updatedAt: resume.updated_at,
    })) ?? []),
  ].filter(
    (resume, index, array) =>
      array.findIndex((item) => item.fileUrl === resume.fileUrl && item.title === resume.title) === index,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      <JobViewTracker
        jobId={isUuid(job.id) ? job.id : null}
        jobSlug={job.slug}
        title={job.title}
        companyName={job.companyName}
        city={job.city}
        sourceType={job.sourceType}
      />

      <SchemaScript
        data={buildJobPostingSchema(job)}
      />
      <SchemaScript
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Jobs", path: "/jobs" },
          { name: job.title, path: `/jobs/${job.slug}` },
        ])}
      />

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div className="space-y-5 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur shadow-sm">
            <div className="flex flex-wrap gap-2">
              {currentMatchSummary ? (
                <Badge className="rounded-full bg-sky-600 text-white">
                  <Sparkles className="size-3.5" />
                  AI Match {currentMatchSummary.matchScore}%
                </Badge>
              ) : null}
              <Badge className="rounded-full">{job.jobType}</Badge>
              <Badge variant="outline" className="rounded-full capitalize">
                {job.workMode}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {job.experienceRequired}
              </Badge>
              {trustProfile?.verifiedEmployer ? <Badge className="rounded-full bg-emerald-600 text-white">Verified employer</Badge> : null}
              {trustProfile?.adminVerified ? <Badge className="rounded-full bg-sky-600 text-white">Admin verified</Badge> : null}
              {job.officialVerified ? (
                <Badge className="rounded-full bg-indigo-600 text-white">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </Badge>
              ) : null}
              {interactionState?.isApplied ? (
                <Badge className="rounded-full bg-emerald-600 text-white">Applied</Badge>
              ) : null}
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-50">{job.title}</h1>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  {job.companyName}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {job.location}
                </p>
                <p className="flex items-center gap-2">
                  <Wallet className="size-4" />
                  {salaryLabel}
                </p>
                <p className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4" />
                  {job.experienceRequired}
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  {formatJobType(job.jobType)}
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  {formatJobType(job.workMode)}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="size-4" />
                  Apply by {formattedDeadline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="rounded-full">
                  {skill}
                </Badge>
              ))}
            </div>

            <div id="job-apply-panel" className="flex flex-wrap gap-3">
              <VerifiedApplyPanel
                jobIdentifier={job.slug}
                jobSlug={job.slug}
                isSignedIn={Boolean(user)}
                isInitiallyApplied={interactionState?.isApplied ?? false}
                resumeOptions={resumeOptions}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <SaveJobButton
                jobIdentifier={job.slug}
                isInitiallySaved={interactionState?.isSaved ?? false}
                isSignedIn={Boolean(user)}
                loginRedirectTo={`/login?next=/jobs/${job.slug}`}
              />
              <ReportJobButton jobIdentifier={job.slug} />
              <Button asChild variant="secondary" className="rounded-full">
                <a href={whatsappShareUrl} rel="nofollow noopener noreferrer" target="_blank">
                  <Share2 className="size-4" />
                  Share on WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-8 p-8">
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">AI match explanation</h2>
                {currentMatchSummary ? (
                  <div className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-slate-800">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="rounded-full bg-sky-600 text-white">
                        {currentMatchSummary.matchScore}% match
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {currentMatchSummary.recommendation}
                      </Badge>
                    </div>
                    <p className="text-sm leading-6">{currentMatchSummary.reason}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white/70 p-4">
                        <p className="text-sm font-semibold text-slate-950">Matching skills</p>
                        <p className="mt-2 text-sm leading-6">
                          {currentMatchSummary.matchingSkills.length > 0
                            ? currentMatchSummary.matchingSkills.join(", ")
                            : "No direct skill overlap detected yet."}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/70 p-4">
                        <p className="text-sm font-semibold text-slate-950">Missing skills</p>
                        <p className="mt-2 text-sm leading-6">
                          {currentMatchSummary.missingSkills.length > 0
                            ? currentMatchSummary.missingSkills.join(", ")
                            : "No major skill gaps found for this role."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    Sign in as a candidate and complete your profile to see your personalized match score for this job.
                  </div>
                )}
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">About this job</h2>
                <p className="leading-7 text-muted-foreground">{job.description}</p>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Responsibilities</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {job.responsibilities.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Requirements</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {job.requirements.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Skills required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="rounded-full">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Education required</h2>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  <GraduationCap className="mt-0.5 size-4 shrink-0 text-slate-500" />
                  <p>{job.educationRequired}</p>
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Salary details</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-950">Compensation</p>
                    <p className="mt-2">{salaryLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-950">Salary transparency</p>
                    <p className="mt-2">
                      {job.salaryDisclosed && (job.salaryMin > 0 || job.salaryMax > 0)
                        ? "This listing includes a stated salary range. Confirm the final compensation in writing during the process."
                        : "The salary is not disclosed. Treat vague or unrealistic earnings promises as a risk signal."}
                    </p>
                  </div>
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Application deadline</h2>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-slate-500" />
                  <div className="space-y-1">
                    <p className="font-medium text-slate-950">Apply by {formattedDeadline}</p>
                    <p className="text-sm text-slate-600">
                      Submit early if the employer reviews applications on a rolling basis.
                    </p>
                  </div>
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Source information</h2>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-medium text-slate-950">
                    {sourceLabel ? `Source: ${sourceLabel}` : "No external source URL provided for this listing."}
                  </p>
                  {job.sourceName ? <p>Provided by {job.sourceName}.</p> : null}
                  {job.sourceUrl ? (
                    <a
                      className="inline-flex items-center gap-1 font-medium text-sky-700 underline-offset-4 hover:underline"
                      href={job.sourceUrl}
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                    >
                      Open source listing
                      <ExternalLink className="size-4" />
                    </a>
                  ) : null}
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Scam warning</h2>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div className="space-y-2">
                      <p>Never pay for interviews, training, registration, or joining.</p>
                      <p>Always verify the final employer identity and source before sharing documents, OTPs, or money.</p>
                      <p>Report fake job posts immediately if the salary, source, or apply flow looks suspicious.</p>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h2 className="font-semibold">Company profile</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {job.companyName} is hiring for {job.industry} roles in {job.location}.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Role type: {formatJobType(job.jobType)}. Work mode: {formatJobType(job.workMode)}.
              </p>
              <div className="flex flex-wrap gap-2">
                {trustProfile?.verifiedEmployer ? (
                  <Badge className="bg-emerald-600 text-white">
                    <BadgeCheck className="mr-1 size-4" />
                    Verified employer
                  </Badge>
                ) : (
                  <Badge variant="outline">Employer verification pending</Badge>
                )}
                {trustProfile?.companyEmailVerified ? (
                  <Badge variant="secondary">Company email verified</Badge>
                ) : (
                  <Badge variant="outline">Company email unverified</Badge>
                )}
                <Badge variant={trustProfile?.domainVerificationStatus === "verified" ? "default" : "outline"}>
                  Domain {trustProfile?.domainVerificationStatus ?? "pending"}
                </Badge>
              </div>
              {safetySignals.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">Trust signals</p>
                  <ul className="mt-2 space-y-2">
                    {safetySignals.map((signal) => (
                      <li key={signal}>- {signal}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-3 p-6 text-sm leading-6 text-muted-foreground">
              <h2 className="font-semibold text-slate-50">Trust and safety policies</h2>
              <p>No payment-demand jobs.</p>
              <p>No misleading salary or false urgency claims.</p>
              <p>No fake government jobs without official verification.</p>
              <p>Use official source links whenever a listing references government or public-sector hiring.</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Similar jobs</h2>
            {similarJobs.map((item) => (
              <JobCard
                key={item.id}
                job={item}
                matchSummary={matchSummaries.get(item.id) ?? null}
                isSaved={interactions.stateByJobId.get(item.id)?.isSaved ?? false}
                isApplied={interactions.stateByJobId.get(item.id)?.isApplied ?? false}
                isSignedIn={interactions.isSignedIn}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Button asChild className="h-11 flex-1 rounded-full" variant={interactionState?.isApplied ? "outline" : "default"}>
            <a href="#job-apply-panel">{interactionState?.isApplied ? "View application" : "Apply now"}</a>
          </Button>
          <div className="shrink-0">
            <SaveJobButton
              jobIdentifier={job.slug}
              isInitiallySaved={interactionState?.isSaved ?? false}
              isSignedIn={Boolean(user)}
              loginRedirectTo={`/login?next=/jobs/${job.slug}`}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
