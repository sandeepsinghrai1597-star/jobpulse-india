import type { Metadata } from "next";
import { siteConfig } from "@/lib/data/site";

export function absoluteUrl(path = "") {
  return `${siteConfig.url}${path}`;
}

export function buildMetadata({
  title,
  description,
  path = "",
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    keywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data, null, 0);
}
