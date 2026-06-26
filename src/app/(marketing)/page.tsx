import { HomePage } from "@/components/marketing/home-page";
import { SchemaScript } from "@/components/shared/schema-script";
import { getUnifiedJobs } from "@/lib/jobs/live";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/data/site";

export const metadata = buildMetadata({
  title: "JobPulse India — Jobs, Resume Builder & AI Career Guidance",
  absoluteTitle: "JobPulse India | Find Jobs, Build Resumes & Prepare for Interviews",
  description:
    "Search 150+ active jobs across India, build ATS-ready resumes, prepare for interviews, and get AI career guidance built for freshers, graduates & professionals.",
  path: "/",
  keywords: [
    "jobs in india",
    "fresher jobs",
    "government jobs india",
    "remote jobs india",
    "resume builder india",
    "interview preparation india",
    "ai career guidance",
    "job search india 2026",
  ],
});

export const revalidate = 300;

export default async function HomeRoute() {
  const jobs = await getUnifiedJobs();
  const latestJobs = jobs.slice(0, 4);
  const heroStats = {
    activeJobs: jobs.length,
    companies: new Set(jobs.map((job) => job.companyName.trim()).filter(Boolean)).size,
    cities: new Set(jobs.map((job) => job.city.trim()).filter(Boolean)).size,
  };

  return (
    <>
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "JobPulse India",
          url: siteConfig.url,
          description:
            "India's AI Career Companion for Jobs, Resumes & Interviews.",
        }}
      />
      <HomePage latestJobs={latestJobs} heroStats={heroStats} />
    </>
  );
}
