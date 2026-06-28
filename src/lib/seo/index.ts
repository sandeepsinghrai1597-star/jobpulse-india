import type { Metadata } from "next";
import { siteConfig } from "@/lib/data/site";
import type { BlogPost, Job, SeoFaq } from "@/types";

export function absoluteUrl(path = "") {
  return `${siteConfig.url}${path}`;
}

export function buildMetadata({
  title,
  absoluteTitle,
  description,
  path = "",
  keywords = [],
  image,
  type = "website",
  publishedTime,
  noIndex = false,
}: {
  title: string;
  absoluteTitle?: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = image
    ? image.startsWith("http://") || image.startsWith("https://")
      ? image
      : absoluteUrl(image)
    : absoluteUrl("/api/og");
  const resolvedTitle = absoluteTitle ? { absolute: absoluteTitle } : title;
  const socialTitle = absoluteTitle ?? title;

  return {
    metadataBase: new URL(siteConfig.url),
    title: resolvedTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_IN",
      type,
      publishedTime,
      images: [{ url: socialImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
      creator: siteConfig.organization.twitterHandle,
    },
  };
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data, null, 0).replace(/</g, "\\u003c");
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.organization.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.organization.logoPath),
    email: siteConfig.organization.email,
    sameAs: siteConfig.organization.sameAs,
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/jobs")}?keyword={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildFaqSchema(faqs: SeoFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema(post: BlogPost) {
  const articleBody =
    post.sections?.flatMap((section) => [section.heading, ...section.content, ...(section.bullets ?? [])]).join(" ") ??
    post.content;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author?.name ?? siteConfig.organization.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.organization.logoPath),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    articleBody,
  };
}

export function buildJobPostingSchema(job: Job) {
  const salaryAvailable = job.salaryMin > 0 || job.salaryMax > 0;
  const directApply = Boolean(job.applicationUrl && job.applicationUrl !== job.sourceUrl);
  const employmentTypeMap: Record<Job["jobType"], string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    freelance: "CONTRACTOR",
    internship: "INTERN",
    "walk-in": "OTHER",
  };
  const descriptionParts = [
    job.description,
    job.responsibilities.length > 0 ? `Responsibilities: ${job.responsibilities.join(" ")}` : "",
    job.requirements.length > 0 ? `Requirements: ${job.requirements.join(" ")}` : "",
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionParts.join(" "),
    url: absoluteUrl(`/jobs/${job.slug}`),
    datePosted: job.publishedAt ?? job.createdAt,
    validThrough: job.applicationDeadline,
    employmentType: employmentTypeMap[job.jobType],
    directApply: directApply || undefined,
    applicantLocationRequirements: {
      "@type": "Country",
      name: job.country,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      sameAs: job.sourceUrl ?? undefined,
    },
    jobLocationType: job.workMode === "remote" ? "TELECOMMUTE" : undefined,
    industry: job.industry,
    identifier: {
      "@type": "PropertyValue",
      name: "JobPulse India",
      value: job.id,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: job.state,
        addressCountry: job.country,
      },
    },
    baseSalary:
      salaryAvailable
        ? {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMin,
            maxValue: job.salaryMax,
            unitText:
              job.salaryType === "monthly"
                ? "MONTH"
                : job.salaryType === "stipend"
                  ? "MONTH"
                  : "YEAR",
          },
        }
        : undefined,
  };
}

export function buildCollectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
