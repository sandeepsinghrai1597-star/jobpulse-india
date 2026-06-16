import { internships } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Internships",
  description:
    "Find paid, unpaid, remote, city-based, college, and startup internships across India.",
  path: "/internships",
});

export default function InternshipsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Internship Portal"
        title="Search internships by stipend, duration, location, and work mode"
        description="A dedicated internship layer helps students and freshers find entry points into startup, remote, and city-based work."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {internships.map((item) => (
          <Card key={item.id} className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.company}</p>
                </div>
                <Badge className="rounded-full">{item.isPaid ? "Paid" : "Unpaid"}</Badge>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <p>Stipend: {item.stipend}</p>
                <p>Duration: {item.duration}</p>
                <p>Location: {item.location}</p>
                <p>Mode: {item.workMode}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="rounded-full">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
