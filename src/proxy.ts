import { NextResponse, type NextRequest } from "next/server";
import { internshipCities } from "@/lib/internships";
import { seoPages } from "@/lib/seo/landing-pages";
import { updateSession } from "@/lib/supabase/proxy";

const knownRootSegments = new Set([
  "",
  "about",
  "admin",
  "ai-career-agent",
  "ai-search",
  "api",
  "auth",
  "blog",
  "career-agent",
  "career-guide",
  "contact",
  "dashboard",
  "employer",
  "fresher-jobs",
  "government-jobs",
  "internships",
  "interview-preparation",
  "jobs",
  "learning-roadmap",
  "login",
  "payment",
  "pricing",
  "privacy-policy",
  "profile",
  "remote-jobs",
  "resume-analyzer",
  "resume-builder",
  "robots.txt",
  "salary-calculator",
  "signup",
  "sitemap.xml",
  "terms",
  "work-from-home-jobs",
  ...seoPages.map((page) => page.slug),
  ...internshipCities.map((city) => `internships-in-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`),
]);

function isUnknownRootSlug(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;

  const [segment] = segments;
  if (!segment || segment.includes(".")) return false;

  return !knownRootSegments.has(segment.toLowerCase());
}

export async function proxy(request: NextRequest) {
  if (isUnknownRootSlug(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
