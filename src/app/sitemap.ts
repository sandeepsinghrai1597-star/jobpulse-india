import type { MetadataRoute } from "next";
import { governmentJobCategories } from "@/lib/data/government-jobs";
import { blogPosts } from "@/lib/data/blog";
import { getApprovedGovernmentJobs } from "@/lib/government-jobs/live";
import { careerGuides } from "@/lib/data/learning-roadmaps";
import { internships, siteConfig } from "@/lib/data/site";
import { buildInternshipCitySlug, internshipCities } from "@/lib/internships";
import { getUnifiedJobs } from "@/lib/jobs/live";
import { seoPages } from "@/lib/seo/landing-pages";

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

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
    })),
    ...activeJobs.map((job) => ({
      url: `${siteConfig.url}/jobs/${job.slug}`,
      lastModified: new Date(job.updatedAt || job.createdAt),
    })),
    ...internships.map((internship) => ({
      url: `${siteConfig.url}/internships/${internship.slug}`,
      lastModified: new Date(internship.deadline),
    })),
    ...internshipCities.map((city) => ({
      url: `${siteConfig.url}/${buildInternshipCitySlug(city)}`,
      lastModified: new Date(),
    })),
    ...blogPosts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...careerGuides.map((guide) => ({
      url: `${siteConfig.url}/career-guide/${guide.slug}`,
      lastModified: new Date(),
    })),
    ...governmentJobCategories.map((category) => ({
      url: `${siteConfig.url}/government-jobs/${category.slug}`,
      lastModified: new Date(),
    })),
    ...governmentJobs.map((job) => ({
      url: `${siteConfig.url}/government-jobs/${job.slug}`,
      lastModified: new Date(job.lastDate),
    })),
    ...seoPages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified: new Date(),
    })),
  ];
}
