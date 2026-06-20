import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/data/site";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo";
import { SchemaScript } from "@/components/shared/schema-script";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: siteConfig.url,
  },
  keywords: [
    "jobs in India",
    "AI career assistant",
    "resume builder",
    "resume analyzer",
    "government jobs",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [{ url: `${siteConfig.url}/api/og` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/api/og`],
    creator: siteConfig.organization.twitterHandle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <SchemaScript data={buildOrganizationSchema()} />
        <SchemaScript data={buildWebsiteSchema()} />
        {children}
      </body>
    </html>
  );
}
