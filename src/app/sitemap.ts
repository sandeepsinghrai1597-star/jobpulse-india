import type { MetadataRoute } from "next";
import { blogPosts, careerGuides, jobs, seoPages, siteConfig } from "@/lib/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/jobs",
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
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
    })),
    ...jobs.map((job) => ({
      url: `${siteConfig.url}/jobs/${job.slug}`,
      lastModified: new Date(job.updatedAt),
    })),
    ...blogPosts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...careerGuides.map((guide) => ({
      url: `${siteConfig.url}/career-guide/${guide.slug}`,
      lastModified: new Date(),
    })),
    ...seoPages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified: new Date(),
    })),
  ];
}
