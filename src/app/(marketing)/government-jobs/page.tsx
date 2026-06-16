import Link from "next/link";
import { governmentJobs } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Government Jobs India",
  description:
    "Track SSC, banking, railways, defence, police, teaching, and state government jobs with official links and disclaimers.",
  path: "/government-jobs",
});

export default function GovernmentJobsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Government Job Hub"
        title="Track official government job updates more safely"
        description="Every listing is designed to emphasize official links, deadlines, fees, eligibility, and the need to verify before applying."
      />
      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Always verify from the official website before applying.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {governmentJobs.map((job) => (
          <Card key={job.id} className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {job.category}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold">{job.title}</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{job.summary}</p>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <p>Eligibility: {job.eligibility}</p>
                <p>Age: {job.ageLimit}</p>
                <p>Fee: {job.fees}</p>
                <p>Last date: {job.lastDate}</p>
              </div>
              <Link href={`/government-jobs/${job.category}`} className="text-sm font-semibold text-primary">
                Explore {job.category} jobs →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
