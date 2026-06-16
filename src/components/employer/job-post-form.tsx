"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { employerJobSchema } from "@/lib/validation/schemas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function parseCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function JobPostForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    title: "",
    description: "",
    city: "",
    state: "",
    workMode: "onsite",
    jobType: "full-time",
    educationRequired: "",
    experienceRequired: "",
    industry: "",
    salaryMin: "0",
    salaryMax: "0",
    applicationUrl: "",
    skills: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const payload = {
      ...form,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      skills: parseCommaSeparated(form.skills),
    };

    const parsed = employerJobSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete the job post form.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/employer/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(result.message ?? "We could not create the job post.");
      setIsSubmitting(false);
      return;
    }

    setMessage(result.message ?? "Job post created.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
      <CardContent className="p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Company name"
              value={form.companyName}
              onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
            />
            <Input
              placeholder="Job title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Input
              placeholder="City"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
            <Input
              placeholder="State"
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            />
            <Select
              value={form.workMode}
              onValueChange={(value: "remote" | "hybrid" | "onsite") =>
                setForm((current) => ({ ...current, workMode: value }))
              }
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue placeholder="Work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.jobType}
              onValueChange={(
                value: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "walk-in",
              ) => setForm((current) => ({ ...current, jobType: value }))}
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="walk-in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Education required"
              value={form.educationRequired}
              onChange={(event) =>
                setForm((current) => ({ ...current, educationRequired: event.target.value }))
              }
            />
            <Input
              placeholder="Experience required"
              value={form.experienceRequired}
              onChange={(event) =>
                setForm((current) => ({ ...current, experienceRequired: event.target.value }))
              }
            />
            <Input
              placeholder="Industry"
              value={form.industry}
              onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
            />
            <Input
              placeholder="Application URL"
              type="url"
              value={form.applicationUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, applicationUrl: event.target.value }))
              }
            />
            <Input
              placeholder="Minimum salary"
              type="number"
              value={form.salaryMin}
              onChange={(event) => setForm((current) => ({ ...current, salaryMin: event.target.value }))}
            />
            <Input
              placeholder="Maximum salary"
              type="number"
              value={form.salaryMax}
              onChange={(event) => setForm((current) => ({ ...current, salaryMax: event.target.value }))}
            />
            <Input
              placeholder="Skills, comma separated"
              value={form.skills}
              onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))}
              className="sm:col-span-2"
            />
          </div>

          <Textarea
            placeholder="Job description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="min-h-40"
          />

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Job not created</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {message ? (
            <Alert>
              <AlertTitle>Job created</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="rounded-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Submitting..." : "Create job post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
