import { internships } from "@/lib/data/site";
import { filterInternships, internshipCities, parseInternshipFilters } from "@/lib/internships";
import { buildMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/shared/schema-script";
import { InternshipsPageShell } from "@/components/internships/internships-page-shell";

export const metadata = buildMetadata({
  title: "Internships in India",
  description:
    "Search paid internships, remote internships, city internships, and skill-based internship openings across India.",
  path: "/internships",
  keywords: [
    "internships in India",
    "paid internships",
    "remote internships",
    "student internships",
    "internship portal",
  ],
});

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseInternshipFilters(params);
  const filteredInternships = filterInternships(filters, internships);

  return (
    <>
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Internships in India",
          description:
            "Internship portal with filters for paid, remote, city, skills, duration, stipend, industry, and deadline.",
          url: "/internships",
        }}
      />
      <InternshipsPageShell
        title="Search internships by stipend, duration, city, and skill"
        description="Use structured filters to narrow paid internships, remote internships, and role-specific openings for students and freshers."
        action="/internships"
        internships={filteredInternships}
        filters={{
          paid: filters.paid,
          remote: filters.remote,
          city: filters.city,
          skills: typeof params.skills === "string" ? params.skills : undefined,
          duration: filters.duration,
          stipend: filters.stipend,
          industry: filters.industry,
          deadline: typeof params.deadline === "string" ? params.deadline : undefined,
        }}
        featuredCities={internshipCities}
      />
    </>
  );
}
