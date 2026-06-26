import { HomePage } from "@/components/marketing/home-page";
import { SchemaScript } from "@/components/shared/schema-script";
import { getUnifiedJobs } from "@/lib/jobs/live";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/data/site";

export const metadata = buildMetadata({
  title: "Find Jobs Faster With Your AI Career Assistant",
  description:
    "Search jobs, improve your resume, prepare for interviews, and get AI career guidance built for India.",
  path: "/",
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
