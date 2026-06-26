import type { MetadataRoute } from "next";
import { governmentJobCategories } from "@/lib/data/government-jobs";
import { blogPosts } from "@/lib/data/blog";
import { getApprovedGovernmentJobs } from "@/lib/government-jobs/live";
import { careerGuides } from "@/lib/data/learning-roadmaps";
import { internships, siteConfig } from "@/lib/data/site";
import { buildInternshipCitySlug, internshipCities } from "@/lib/internships";
import { getUnifiedJobs } from "@/lib/jobs/live";
import { seoPages } from "@/lib/seo/landing-pages";

function safeLastModified(...values: Array<string | Date | null | undefined>) {
  for (const value of values) {
    if (!value) continue;

    const parsed = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getUnifiedJobs();
  const governmentJobs = await getApprovedGovernmentJobs();
  const activeJobs = jobs.filter((job) => job.status === "active");
  const staticRoutes = [
    "",
    "/jobs",
    "/ai-career-agent",
    "/career-agent",
    "/resume-builder",
    "/resume-analyzer",
    "/interview-preparation",
    "/salary-calculator",
    "/government-jobs",
    "/internships",
    "/pricing",
    "/blog",
    "/career-guide",
    "/learning-roadmap",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/remote-jobs",
  ];

  const highPriorityRoutes = ["", "/jobs", "/government-jobs", "/internships", "/pricing"];
  const mediumPriorityRoutes = staticRoutes.filter((r) => !highPriorityRoutes.includes(r));

  return [
    ...highPriorityRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1.0 : 0.9,
    })),
    ...mediumPriorityRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...activeJobs.map((job) => ({
      url: `${siteConfig.url}/jobs/${job.slug}`,
      lastModified: safeLastModified(job.updatedAt, job.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...internships.map((internship) => ({
      url: `${siteConfig.url}/internships/${internship.slug}`,
      lastModified: safeLastModified(internship.deadline),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...internshipCities.map((city) => ({
      url: `${siteConfig.url}/${buildInternshipCitySlug(city)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: safeLastModified(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...careerGuides.map((guide) => ({
      url: `${siteConfig.url}/career-guide/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...governmentJobCategories.map((category) => ({
      url: `${siteConfig.url}/government-jobs/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...governmentJobs.map((job) => ({
      url: `${siteConfig.url}/government-jobs/${job.slug}`,
      lastModified: safeLastModified(job.lastDate),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...seoPages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
