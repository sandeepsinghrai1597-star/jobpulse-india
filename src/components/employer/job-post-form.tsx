"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { employerJobSchema } from "@/lib/validation/schemas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type EmployerJobFormValues = {
  companyName?: string;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string;
  salaryMin: string;
  salaryMax: string;
  city: string;
  state: string;
  workMode: "remote" | "hybrid" | "onsite";
  jobType: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "walk-in";
  educationRequired: string;
  experienceRequired: string;
  industry: string;
  openings: string;
  deadline: string;
  applicationUrl: string;
  noCandidatePayment: boolean;
  salaryDisclosed: boolean;
  governmentSourceVerified: boolean;
};

const emptyJob: EmployerJobFormValues = {
  companyName: "",
  title: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  salaryMin: "",
  salaryMax: "",
  city: "",
  state: "",
  workMode: "onsite",
  jobType: "full-time",
  educationRequired: "",
  experienceRequired: "",
  industry: "",
  openings: "1",
  deadline: "",
  applicationUrl: "",
  noCandidatePayment: true,
  salaryDisclosed: true,
  governmentSourceVerified: false,
};

function parseList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-semibold text-slate-900">{label}</span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function JobPostForm({
  initialJob,
  jobId,
}: {
  initialJob?: Partial<EmployerJobFormValues>;
  jobId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EmployerJobFormValues>({ ...emptyJob, ...initialJob });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(jobId);

  function update<K extends keyof EmployerJobFormValues>(key: K, value: EmployerJobFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const payload = {
      ...form,
      responsibilities: parseList(form.responsibilities),
      requirements: parseList(form.requirements),
      skills: parseList(form.skills),
      salaryMin: Number(form.salaryMin || 0),
      salaryMax: Number(form.salaryMax || 0),
      openings: Number(form.openings || 0),
      applicationUrl: form.applicationUrl.trim(),
    };

    const parsed = employerJobSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete the job post form.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(jobId ? `/api/employer/jobs/${jobId}` : "/api/employer/jobs", {
      method: jobId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(result.message ?? "We could not save the job post.");
      setIsSubmitting(false);
      return;
    }

    setMessage(result.message ?? "Job post saved.");
    setIsSubmitting(false);
    router.refresh();

    if (!isEditing) {
      router.push("/employer/jobs");
    }
  }

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50">
        <CardTitle className="text-lg text-slate-950">
          {isEditing ? "Edit job details" : "Create a job post"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Role basics" description="Give candidates the essential role and location context first.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Job title">
                <Input value={form.title} onChange={(event) => update("title", event.target.value)} />
              </Field>
              <Field label="Company name" hint="Uses your employer profile if left blank.">
                <Input
                  value={form.companyName ?? ""}
                  onChange={(event) => update("companyName", event.target.value)}
                />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(event) => update("city", event.target.value)} />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={(event) => update("state", event.target.value)} />
              </Field>
              <Field label="Work mode">
                <Select value={form.workMode} onValueChange={(value: EmployerJobFormValues["workMode"]) => update("workMode", value)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Job type">
                <Select value={form.jobType} onValueChange={(value: EmployerJobFormValues["jobType"]) => update("jobType", value)}>
                  <SelectTrigger className="w-full bg-white">
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
              </Field>
            </div>
          </FormSection>

          <FormSection title="Candidate fit" description="Define experience, education, skills, and responsibilities clearly.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Education required">
                <Input
                  value={form.educationRequired}
                  onChange={(event) => update("educationRequired", event.target.value)}
                />
              </Field>
              <Field label="Experience required">
                <Input
                  value={form.experienceRequired}
                  onChange={(event) => update("experienceRequired", event.target.value)}
                />
              </Field>
              <Field label="Industry">
                <Input value={form.industry} onChange={(event) => update("industry", event.target.value)} />
              </Field>
              <Field label="Skills" hint="Use one line per skill, or comma-separated text.">
                <Textarea
                  value={form.skills}
                  onChange={(event) => update("skills", event.target.value)}
                  className="min-h-24 bg-white"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className="min-h-36 bg-white"
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Responsibilities" hint="Use one line per point, or comma-separated text.">
                <Textarea
                  value={form.responsibilities}
                  onChange={(event) => update("responsibilities", event.target.value)}
                  className="min-h-32 bg-white"
                />
              </Field>
              <Field label="Requirements" hint="Use one line per point, or comma-separated text.">
                <Textarea
                  value={form.requirements}
                  onChange={(event) => update("requirements", event.target.value)}
                  className="min-h-32 bg-white"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Compensation and apply" description="Set salary, openings, deadline, and optional external apply link.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Openings">
                <Input
                  min={1}
                  type="number"
                  value={form.openings}
                  onChange={(event) => update("openings", event.target.value)}
                />
              </Field>
              <Field label="Deadline">
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => update("deadline", event.target.value)}
                />
              </Field>
              <Field label="Salary min">
                <Input
                  min={0}
                  type="number"
                  value={form.salaryMin}
                  onChange={(event) => update("salaryMin", event.target.value)}
                />
              </Field>
              <Field label="Salary max">
                <Input
                  min={0}
                  type="number"
                  value={form.salaryMax}
                  onChange={(event) => update("salaryMax", event.target.value)}
                />
              </Field>
              <Field label="Application URL optional">
                <Input
                  type="url"
                  value={form.applicationUrl}
                  onChange={(event) => update("applicationUrl", event.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <label className="flex items-start gap-3">
                <input
                  checked={form.noCandidatePayment}
                  type="checkbox"
                  onChange={(event) => update("noCandidatePayment", event.target.checked)}
                />
                <span>I confirm this job does not ask candidates for money, deposits, training fees, or joining charges.</span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  checked={form.salaryDisclosed}
                  type="checkbox"
                  onChange={(event) => update("salaryDisclosed", event.target.checked)}
                />
                <span>I confirm the salary details are truthful. If salary is undisclosed, I will keep both salary fields at 0.</span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  checked={form.governmentSourceVerified}
                  type="checkbox"
                  onChange={(event) => update("governmentSourceVerified", event.target.checked)}
                />
                <span>Government or public-sector jobs must point to an official source before publication.</span>
              </label>
            </div>
          </FormSection>

          {error ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="size-4" />
              <AlertTitle>Job not saved</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {message ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
              <CheckCircle2 className="size-4" />
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription className="text-emerald-800">{message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              New and edited jobs go to pending review unless admin approval is disabled. Policies: no payment-demand jobs, no misleading salary, and no fake government jobs.
            </p>
            <Button className="sm:w-auto" disabled={isSubmitting} type="submit">
              <Save className="size-4" />
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create job post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
