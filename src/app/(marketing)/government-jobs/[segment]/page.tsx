import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import {
  getGovernmentJobCategoryBySlug,
  governmentJobsDisclaimer,
} from "@/lib/data/government-jobs";
import {
  getGovernmentJobBySlug,
  getGovernmentJobsByCategory,
  getGovernmentSegments,
  getRelatedGovernmentJobs,
} from "@/lib/government-jobs/live";
import { SchemaScript } from "@/components/shared/schema-script";
import { Card, CardContent } from "@/components/ui/card";

export async function generateStaticParams() {
  const segments = await getGovernmentSegments();
  return segments.map((segment) => ({ segment }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const category = getGovernmentJobCategoryBySlug(segment);

  if (category) {
    const jobs = await getGovernmentJobsByCategory(category.slug);

    return buildMetadata({
      title: `${category.name} Government Jobs 2026`,
      description: `${category.intro} Check eligibility, age limit, application fee, last date, selection process, and official links.`,
      path: `/government-jobs/${category.slug}`,
      keywords: [...category.keywords, ...jobs.map((job) => job.title)],
    });
  }

  const job = await getGovernmentJobBySlug(segment);

  if (!job) {
    return buildMetadata({
      title: "Government job page not found",
      description: "The requested government jobs page could not be found.",
      path: `/government-jobs/${segment}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${job.title} 2026: Eligibility, Last Date, Apply Link`,
    description: `${job.title} notification with department, eligibility, age limit, application fee, official notification link, apply link, syllabus, selection process, and important dates.`,
    path: `/government-jobs/${job.slug}`,
    keywords: [job.title, job.department, job.category, `${job.category} jobs`, `${job.state} government jobs`],
  });
}

export default async function GovernmentJobsDynamicPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const category = getGovernmentJobCategoryBySlug(segment);

  if (category) {
    const items = await getGovernmentJobsByCategory(category.slug);

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SchemaScript
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Government Jobs",
                item: "/government-jobs",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: category.name,
                item: `/government-jobs/${category.slug}`,
              },
            ],
          }}
        />
        <SchemaScript
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.slice(0, 3).map((job) => ({
              "@type": "Question",
              name: `What should candidates check before applying for ${job.title}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${job.title} candidates should confirm eligibility, age limit, application fee, important dates, and the official notification on the department website before applying.`,
              },
            })),
          }}
        />

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Government Job Category
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
            {category.name} Government Jobs 2026
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            {category.intro} This page is built for government-job-style browsing with quick internal links to official notification pages, application links, and exam-oriented details.
          </p>
          <p className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {governmentJobsDisclaimer}
          </p>
        </div>

        <section className="mt-10 grid gap-6">
          {items.map((job) => (
            <Card key={job.id} className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      {job.department}
                    </p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold">{job.title}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                    {job.state}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{job.summary}</p>
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                  <p>Eligibility: {job.eligibility}</p>
                  <p>Age limit: {job.ageLimit}</p>
                  <p>Application fee: {job.applicationFee}</p>
                  <p>Last date: {job.lastDate}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold">
                  <Link href={`/government-jobs/${job.slug}`} className="text-primary">
                    Read full details
                  </Link>
                  <a href={job.officialNotificationLink} target="_blank" rel="noreferrer" className="text-muted-foreground">
                    Official notification
                  </a>
                  <a href={job.applyLink} target="_blank" rel="noreferrer" className="text-muted-foreground">
                    Apply link
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    );
  }

  const job = await getGovernmentJobBySlug(segment);
  if (!job) notFound();

  const relatedJobs = await getRelatedGovernmentJobs(job.slug, job.categorySlug ?? "");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Government Jobs",
              item: "/government-jobs",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: job.category,
              item: `/government-jobs/${job.categorySlug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: job.title,
              item: `/government-jobs/${job.slug}`,
            },
          ],
        }}
      />
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (job.faq ?? []).map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/government-jobs/${job.categorySlug}`}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
              >
                {job.category}
              </Link>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                {job.state}
              </span>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">{job.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{job.summary}</p>
            <p className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {governmentJobsDisclaimer}
            </p>
          </section>

          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="grid gap-4 p-8 sm:grid-cols-2">
              <p><span className="font-semibold text-foreground">Department:</span> {job.department}</p>
              <p><span className="font-semibold text-foreground">Category:</span> {job.category}</p>
              <p><span className="font-semibold text-foreground">State:</span> {job.state}</p>
              <p><span className="font-semibold text-foreground">Eligibility:</span> {job.eligibility}</p>
              <p><span className="font-semibold text-foreground">Age limit:</span> {job.ageLimit}</p>
              <p><span className="font-semibold text-foreground">Application fee:</span> {job.applicationFee}</p>
              <p><span className="font-semibold text-foreground">Last date:</span> {job.lastDate}</p>
              <p><span className="font-semibold text-foreground">Openings:</span> {job.openings}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-8 p-8">
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Official notification link</h2>
                {job.officialNotificationLink ? (
                  <a
                    href={job.officialNotificationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary"
                  >
                    Visit official notification
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Verify the latest notification on the official website.</p>
                )}
              </section>
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Apply link</h2>
                {job.applyLink ? (
                  <a href={job.applyLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                    Apply online
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Use the official website to confirm whether an online application link is available.</p>
                )}
              </section>
              {job.syllabus ? (
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Syllabus</h2>
                <p className="leading-7 text-muted-foreground">{job.syllabus}</p>
              </section>
              ) : null}
              {job.selectionProcess ? (
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Selection process</h2>
                <p className="leading-7 text-muted-foreground">{job.selectionProcess}</p>
              </section>
              ) : null}
              {(job.importantDates ?? []).length > 0 ? (
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Important dates</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {(job.importantDates ?? []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
              ) : null}
              <section className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold">Why this page matters</h2>
                <p className="leading-7 text-muted-foreground">
                  This page groups official-link-first details so candidates can quickly review department, category, state, eligibility, age limit, fee, syllabus, selection process, and important dates before visiting the source website.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-5 p-8">
              <h2 className="font-heading text-2xl font-semibold">Frequently asked questions</h2>
              {(job.faq ?? []).map((item) => (
                <div key={item.question} className="space-y-2">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-heading text-2xl font-semibold">Quick actions</h2>
              <div className="space-y-3 text-sm font-semibold">
                <a href={job.officialNotificationLink ?? job.officialUrl ?? "#"} target="_blank" rel="noreferrer" className="block text-primary">
                  Open official notification
                </a>
                <a href={job.applyLink ?? job.officialUrl ?? "#"} target="_blank" rel="noreferrer" className="block text-primary">
                  Open apply link
                </a>
                {job.sourceUrl ? (
                  <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="block text-primary">
                    Open source page
                  </a>
                ) : null}
                <Link href={`/government-jobs/${job.categorySlug}`} className="block text-primary">
                  Browse more {job.category} jobs
                </Link>
                <Link href="/government-jobs" className="block text-primary">
                  Back to Government Jobs Hub
                </Link>
              </div>
            </CardContent>
          </Card>

          {job.salary ? (
          <Card className="rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-heading text-2xl font-semibold">Salary snapshot</h2>
              <p className="text-sm leading-6 text-muted-foreground">{job.salary}</p>
            </CardContent>
          </Card>
          ) : null}

          {relatedJobs.length ? (
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold">Related internal links</h2>
              {relatedJobs.map((item) => (
                <Card key={item.id} className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
                  <CardContent className="space-y-3 p-5">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        {item.category}
                      </p>
                      <h3 className="mt-2 font-heading text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    <Link href={`/government-jobs/${item.slug}`} className="text-sm font-semibold text-primary">
                      Read full details
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
