import { notFound } from "next/navigation";
import { Building2, CalendarClock, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { mapCandidateProfileRow } from "@/lib/candidate/profile";
import { getSimilarUnifiedJobs, getUnifiedJob } from "@/lib/jobs/search";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/jobs/job-card";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { VerifiedApplyPanel } from "@/components/jobs/verified-apply-panel";
import { SchemaScript } from "@/components/shared/schema-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    });
  }

  return buildMetadata({
    title: `${job.title} at ${job.companyName}`,
    description: `${job.title} in ${job.location}. ${job.experienceRequired} · ${job.educationRequired}. Apply online with JobPulse India.`,
    path: `/jobs/${job.slug}`,
    keywords: [job.title, job.city, job.industry, ...job.skills],
  });
}

export const dynamic = "force-dynamic";

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

  let verificationStatus: "draft" | "pending" | "verified" | "rejected" | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select(
        "id, user_id, full_name, phone, headline, bio, education, skills, experience, city, state, preferred_roles, expected_salary, preferred_job_types, language_preference, resume_url, verified, verification_status, verification_requested_at, verified_at, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    verificationStatus = mapCandidateProfileRow(profile).verificationStatus;
  }

  const similarJobs = await getSimilarUnifiedJobs(slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: job.createdAt,
          validThrough: job.applicationDeadline,
          employmentType: job.jobType,
          hiringOrganization: {
            "@type": "Organization",
            name: job.companyName,
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.city,
              addressRegion: job.state,
              addressCountry: job.country,
            },
          },
        }}
      />
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div className="space-y-5 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-8 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full">{job.jobType}</Badge>
              <Badge variant="outline" className="rounded-full capitalize">
                {job.workMode}
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-50">
                {job.title}
              </h1>
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
                  {job.salaryMin > 0 || job.salaryMax > 0
                    ? `₹${job.salaryMin.toLocaleString("en-IN")} - ₹${job.salaryMax.toLocaleString("en-IN")} / ${job.salaryType}`
                    : "Salary not disclosed"}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="size-4" />
                  Apply by {job.applicationDeadline}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <VerifiedApplyPanel
                jobIdentifier={job.slug}
                applicationUrl={job.applicationUrl}
                isSignedIn={Boolean(user)}
                verificationStatus={verificationStatus}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <SaveJobButton jobIdentifier={job.slug} />
              <Button variant="secondary" className="rounded-full">
                Share on WhatsApp
              </Button>
            </div>
            {job.sourceName ? (
              <p className="text-sm font-medium text-primary">
                Source: {job.sourceName}
                {job.officialVerified ? " · Official source" : ""}
              </p>
            ) : null}
          </div>

          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-8 p-8">
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Job description</h2>
                <p className="leading-7 text-muted-foreground">{job.description}</p>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Responsibilities</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {job.responsibilities.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Requirements</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {job.requirements.map((item) => (
                    <li key={item}>• {item}</li>
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
                {job.companyName} is hiring for {job.industry} roles in {job.location}. The company profile block is ready for verified recruiter data, company logo, and employer dashboard links.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Similar jobs</h2>
            {similarJobs.map((item) => (
              <JobCard key={item.id} job={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
