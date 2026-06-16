import Link from "next/link";
import { Building2, MapPin, Wallet } from "lucide-react";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function formatSalary(job: Job) {
  if (job.salaryMin <= 0 && job.salaryMax <= 0) {
    return "Salary not disclosed";
  }

  const formattedMin = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(job.salaryMin);
  const formattedMax = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(job.salaryMax);

  return `${formattedMin} - ${formattedMax} / ${job.salaryType}`;
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-slate-950/70 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {job.featured ? <Badge className="rounded-full">Featured</Badge> : null}
              <Badge variant="outline" className="rounded-full capitalize">
                {job.workMode}
              </Badge>
            </div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold text-primary">
            {job.companyLogo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <Building2 className="size-4" />
            {job.companyName}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4" />
            {job.location}
          </p>
          <p className="flex items-center gap-2 sm:col-span-2">
            <Wallet className="size-4" />
            {formatSalary(job)}
          </p>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {job.description}
        </p>
        {job.sourceName ? (
          <p className="text-xs font-medium text-primary">
            Source: {job.sourceName}
            {job.officialVerified ? " · Official source" : ""}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="rounded-full">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {job.experienceRequired} · {job.educationRequired}
        </p>
        <Button asChild className="rounded-full">
          <Link href={`/jobs/${job.slug}`}>View Job</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
