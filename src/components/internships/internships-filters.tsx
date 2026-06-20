import { internshipCities, internshipDurations, internshipIndustries, internshipSkills } from "@/lib/internships";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type InternshipFiltersProps = {
  action: string;
  values: {
    paid?: boolean;
    remote?: boolean;
    city?: string;
    skills?: string;
    duration?: string;
    stipend?: string;
    industry?: string;
    deadline?: string;
  };
};

export function InternshipsFilters({ action, values }: InternshipFiltersProps) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <form action={action} className="grid gap-4 lg:grid-cols-4">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="paid"
              value="true"
              defaultChecked={values.paid}
              className="size-4 rounded border-slate-300"
            />
            Paid internship
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="remote"
              value="true"
              defaultChecked={values.remote}
              className="size-4 rounded border-slate-300"
            />
            Remote internship
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">City</span>
            <select
              name="city"
              defaultValue={values.city ?? ""}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All cities</option>
              {internshipCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Skills</span>
            <Input
              name="skills"
              defaultValue={values.skills ?? ""}
              placeholder={`e.g. ${internshipSkills.slice(0, 3).join(", ")}`}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Duration</span>
            <select
              name="duration"
              defaultValue={values.duration ?? ""}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Any duration</option>
              {internshipDurations.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Stipend</span>
            <select
              name="stipend"
              defaultValue={values.stipend ?? ""}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Any stipend</option>
              <option value="0-10000">Up to Rs 10,000</option>
              <option value="10001-15000">Rs 10,001 - Rs 15,000</option>
              <option value="15001-20000">Rs 15,001 - Rs 20,000</option>
              <option value="20001+">Above Rs 20,000</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Industry</span>
            <select
              name="industry"
              defaultValue={values.industry ?? ""}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All industries</option>
              {internshipIndustries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Deadline</span>
            <select
              name="deadline"
              defaultValue={values.deadline ?? ""}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Any deadline</option>
              <option value="7">Within 7 days</option>
              <option value="14">Within 14 days</option>
              <option value="30">Within 30 days</option>
            </select>
          </label>
          <div className="flex items-end gap-3">
            <Button type="submit" className="rounded-lg">
              Apply filters
            </Button>
            <Button type="reset" asChild variant="outline" className="rounded-lg">
              <a href={action}>Reset</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
