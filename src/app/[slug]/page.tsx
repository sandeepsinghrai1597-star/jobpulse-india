import { notFound } from "next/navigation";
import { internships } from "@/lib/data/site";
import {
  filterGovernmentJobsForSeoPage,
  filterJobsForSeoPage,
  getRelatedBlogPosts,
  getRelatedCategoryPages,
  getRelatedCityPages,
  getSeoPageBySlug,
  seoPages,
} from "@/lib/seo/landing-pages";
import {
  cityFromInternshipSlug,
  filterInternships,
  internshipCities,
  parseInternshipFilters,
} from "@/lib/internships";
import { buildCollectionPageSchema, buildMetadata } from "@/lib/seo";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";
import { InternshipsPageShell } from "@/components/internships/internships-page-shell";
import { SchemaScript } from "@/components/shared/schema-script";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...seoPages.map((page) => ({ slug: page.slug })),
    ...internshipCities.map((city) => ({
      slug: `internships-in-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const internshipCity = cityFromInternshipSlug(slug);

  if (internshipCity) {
    return buildMetadata({
      title: `Internships in ${internshipCity}`,
      description: `Find paid, remote, and skill-based internships in ${internshipCity} with stipend, duration, and deadline filters.`,
      path: `/${slug}`,
      keywords: [
        `internships in ${internshipCity}`,
        `${internshipCity} internships`,
        "paid internships",
        "remote internships",
      ],
    });
  }

  const page = getSeoPageBySlug(slug);
  if (!page) notFound();

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function DynamicSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const city = cityFromInternshipSlug(slug);

  if (city) {
    const paramsMap = await searchParams;
    const filters = parseInternshipFilters(paramsMap);
    const filteredInternships = filterInternships(
      { ...filters, city },
      internships.filter((item) => item.city.toLowerCase() === city.toLowerCase()),
    );

    return (
      <>
        <SchemaScript
          data={buildCollectionPageSchema({
            name: `Internships in ${city}`,
            description: `City internship listings for ${city} with stipend, skill, and deadline filters.`,
            path: `/${slug}`,
          })}
        />
        <InternshipsPageShell
          title={`Internships in ${city}`}
          description={`Explore current internship openings in ${city}, then narrow the list by paid roles, remote options, skills, duration, industry, stipend, and deadline.`}
          action={`/${slug}`}
          internships={filteredInternships}
          filters={{
            paid: filters.paid,
            remote: filters.remote,
            city,
            skills: typeof paramsMap.skills === "string" ? paramsMap.skills : undefined,
            duration: filters.duration,
            stipend: filters.stipend,
            industry: filters.industry,
            deadline: typeof paramsMap.deadline === "string" ? paramsMap.deadline : undefined,
          }}
          featuredCities={internshipCities.filter((item) => item !== city)}
        />
      </>
    );
  }

  const page = getSeoPageBySlug(slug);
  if (!page) notFound();

  const unifiedJobs = await searchUnifiedJobs({});
  const jobs = filterJobsForSeoPage(page, unifiedJobs);
  const governmentJobListings = filterGovernmentJobsForSeoPage(page);

  return (
    <SeoLandingPage
      page={page}
      jobs={jobs}
      governmentJobListings={governmentJobListings}
      relatedCities={getRelatedCityPages(page.slug).map((item) => ({
        href: `/${item.slug}`,
        label: item.h1,
      }))}
      relatedCategories={getRelatedCategoryPages(page.slug).map((item) => ({
        href: `/${item.slug}`,
        label: item.h1,
      }))}
      relatedPosts={getRelatedBlogPosts(page)}
    />
  );
}
