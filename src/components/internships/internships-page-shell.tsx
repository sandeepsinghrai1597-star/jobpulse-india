import { buildInternshipCitySlug } from "@/lib/internships";
import type { Internship } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { InternshipCard } from "./internship-card";
import { InternshipsFilters } from "./internships-filters";

type InternshipsPageShellProps = {
  title: string;
  description: string;
  action: string;
  internships: Internship[];
  filters: {
    paid?: boolean;
    remote?: boolean;
    city?: string;
    skills?: string;
    duration?: string;
    stipend?: string;
    industry?: string;
    deadline?: string;
  };
  featuredCities?: string[];
};

export function InternshipsPageShell({
  title,
  description,
  action,
  internships,
  filters,
  featuredCities = [],
}: InternshipsPageShellProps) {
  const activeFilters = Object.entries(filters).filter(([, value]) => Boolean(value));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Internship Portal"
        title={title}
        description={description}
      />

      {featuredCities.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {featuredCities.map((city) => (
            <Badge key={city} variant="secondary" className="rounded-full px-3 py-1">
              <a href={`/${buildInternshipCitySlug(city)}`}>Internships in {city}</a>
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <InternshipsFilters action={action} values={filters} />
      </div>

      {activeFilters.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <Badge key={key} variant="secondary" className="rounded-full px-3 py-1">
              {key}: {String(value)}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {internships.length} internship{internships.length === 1 ? "" : "s"}
        </p>
      </div>

      {internships.length ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {internships.map((item) => (
            <InternshipCard key={item.id} internship={item} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-muted-foreground">
          No internships matched these filters yet. Try widening the city, stipend, or skills selection.
        </div>
      )}
    </div>
  );
}
