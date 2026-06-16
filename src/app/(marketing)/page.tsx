import { HomePage } from "@/components/marketing/home-page";
import { SchemaScript } from "@/components/shared/schema-script";
import { getUnifiedJobs } from "@/lib/jobs/live";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Find Jobs Faster With Your AI Career Assistant",
  description:
    "Search jobs, improve your resume, prepare for interviews, and get AI career guidance built for India.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function HomeRoute() {
  const latestJobs = (await getUnifiedJobs()).slice(0, 4);

  return (
    <>
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "JobPulse India",
          url: "https://jobpulseindia.in",
          description:
            "India's AI Career Companion for Jobs, Resumes & Interviews.",
        }}
      />
      <HomePage latestJobs={latestJobs} />
    </>
  );
}
