import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Clock3, IndianRupee, MapPin } from "lucide-react";
import type { Internship } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function InternshipCard({ internship }: { internship: Internship }) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-slate-200/70">
      <CardHeader className="gap-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {internship.isPaid ? <Badge className="rounded-lg">Paid</Badge> : null}
              <Badge variant="outline" className="rounded-lg capitalize">
                {internship.workMode}
              </Badge>
              <Badge variant="secondary" className="rounded-lg">
                {internship.industry}
              </Badge>
            </div>
            <CardTitle className="text-lg text-slate-950">{internship.title}</CardTitle>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {internship.companyLogo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <Building2 className="size-4" />
            {internship.company}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4" />
            {internship.location}
          </p>
          <p className="flex items-center gap-2">
            <IndianRupee className="size-4" />
            {internship.stipend}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="size-4" />
            {internship.duration}
          </p>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {internship.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {internship.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="rounded-lg">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3 border-slate-100 bg-slate-50">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <BriefcaseBusiness className="size-4" />
          Apply before {internship.deadline}
        </p>
        <Button asChild className="rounded-lg">
          <Link href={`/internships/${internship.slug}`}>
            Apply now
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
