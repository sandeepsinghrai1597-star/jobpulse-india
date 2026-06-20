import { getRelatedBlogPosts, getRelatedCategoryPages, getRelatedCityPages, getSeoPageBySlug, filterGovernmentJobsForSeoPage, filterJobsForSeoPage } from "@/lib/seo/landing-pages";
import { buildMetadata } from "@/lib/seo";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";

const page = getSeoPageBySlug("fresher-jobs");

export const metadata = page
  ? buildMetadata({
      title: page.title,
      description: page.description,
      path: "/fresher-jobs",
      keywords: page.keywords,
    })
  : undefined;

export default async function FresherJobsPage() {
  if (!page) {
    return null;
  }

  const jobs = filterJobsForSeoPage(page, await searchUnifiedJobs({}));

  return (
    <SeoLandingPage
      page={page}
      jobs={jobs}
      governmentJobListings={filterGovernmentJobsForSeoPage(page)}
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
