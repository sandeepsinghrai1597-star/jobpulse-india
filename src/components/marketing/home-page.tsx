import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileSearch,
  GraduationCap,
  Landmark,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import { blogPosts, governmentJobs, jobCategories, jobs, testimonials } from "@/lib/data/site";
import type { Job } from "@/types";
import { JobCard } from "@/components/jobs/job-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { SearchBar } from "@/components/shared/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const aiPrompts = [
  "I am BCA graduate. What jobs should I apply for?",
  "How can I become a data analyst?",
  "Improve my resume for fresher jobs.",
];

const toolCards = [
  {
    icon: FileSearch,
    title: "Resume ATS Analyzer",
    description: "Get a score, keyword gaps, and role-specific improvement suggestions.",
    href: "/resume-analyzer",
  },
  {
    icon: Sparkles,
    title: "Resume Builder",
    description: "Create ATS-friendly resumes for fresher, IT, sales, banking, and internship roles.",
    href: "/resume-builder",
  },
  {
    icon: MessageSquareText,
    title: "Interview Preparation",
    description: "Practice HR, technical, behavioral, and fresher interview questions with AI.",
    href: "/interview-preparation",
  },
];

export function HomePage({ latestJobs = jobs.slice(0, 4) }: { latestJobs?: Job[] }) {
  return (
    <div className="space-y-20 pb-20">
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-slate-950/60 px-6 py-10 shadow-2xl shadow-cyan-950/20 backdrop-blur md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-12">
          <div className="space-y-8">
            <Badge className="rounded-full bg-cyan-400/15 px-4 py-1 text-cyan-200 hover:bg-cyan-400/15">
              India&apos;s AI Career Companion
            </Badge>
            <div className="space-y-5">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-50 md:text-6xl">
                Find Jobs Faster With Your AI Career Assistant
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Search jobs, improve your resume, prepare for interviews, and get daily career guidance built for Indian students, freshers, and professionals.
              </p>
            </div>
            <SearchBar />
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/jobs">Find Jobs</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/resume-builder">Upload Resume</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href="/pricing">See Plans</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-[1.75rem] border-white/10 bg-slate-900/90 text-white shadow-lg">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
                  <Bot className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-200">AI Career Agent</p>
                  <p className="text-sm text-slate-300">Guidance, matching, and roadmap suggestions</p>
                </div>
              </div>
              <div className="space-y-3">
                {aiPrompts.map((prompt) => (
                  <div key={prompt} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-100">
                    {prompt}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-medium text-emerald-200">Built for mobile-first India</p>
                <p className="mt-1 text-sm leading-6 text-emerald-100/90">
                  English-first UI, Hindi-friendly copy, fresher job focus, and local city/category landing pages for SEO growth.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[
          { label: "Active jobs", value: "12K+" },
          { label: "AI resume checks", value: "48K+" },
          { label: "Interview questions", value: "1.2L+" },
          { label: "Cities covered", value: "200+" },
        ].map((item) => (
          <Card key={item.label} className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-2 p-5">
              <p className="text-3xl font-semibold tracking-tight text-slate-50">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular Categories"
          title="Explore the job paths candidates search most"
          description="Optimized for freshers, local hiring, remote opportunities, and category-led discovery."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobCategories.map((category) => (
            <Card key={category} className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="flex items-center justify-between p-5">
                <p className="font-medium text-slate-100">{category}</p>
                <ArrowRight className="size-4 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Latest Jobs"
            title="Fresh job listings ready to apply"
            description="Structured job cards with salary, experience, education, and quick apply context."
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/jobs">View all jobs</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-[1.75rem] border-white/10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="space-y-4 p-6">
              <Target className="size-10 text-cyan-200" />
              <h3 className="font-heading text-2xl font-semibold">AI Career Agent</h3>
              <p className="text-sm leading-6 text-blue-50/90">
                Understand role fit, skill gaps, salary range, and a 7-day action plan.
              </p>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/career-agent">Start chat</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur lg:col-span-2">
            <CardContent className="grid gap-5 p-6 md:grid-cols-3">
              {toolCards.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="rounded-3xl border border-white/10 p-5 transition hover:border-primary/30 hover:bg-white/5"
                >
                  <tool.icon className="mb-4 size-8 text-primary" />
                  <h3 className="font-semibold text-slate-50">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <Landmark className="size-8 text-primary" />
                <div>
                  <h3 className="font-heading text-2xl font-semibold">Government Jobs Hub</h3>
                  <p className="text-sm text-muted-foreground">
                    Official links, last dates, and clear disclaimers
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {governmentJobs.map((job) => (
                  <div key={job.id} className="rounded-2xl border border-white/10 p-4">
                    <p className="font-medium text-slate-50">{job.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.department} · Last date {job.lastDate}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-700">
                Always verify from the official website before applying.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.75rem] border-white/10 bg-slate-950 text-white">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="size-8 text-cyan-300" />
                <div>
                  <h3 className="font-heading text-2xl font-semibold">Learning Roadmaps</h3>
                  <p className="text-sm text-slate-300">
                    Weekly plans to close your skill gaps faster
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "How to become Data Analyst",
                  "How to become Web Developer",
                  "How to become Digital Marketer",
                  "How to become AI Agent Developer",
                ].map((guide) => (
                  <div key={guide} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    {guide}
                  </div>
                ))}
              </div>
              <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/career-guide/data-analyst">View roadmaps</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trusted by users"
          title="Designed to feel simple, useful, and supportive"
          description="Helpful for students, freshers, career switchers, and recruiters who want speed without confusion."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="space-y-4 p-6">
                <p className="text-base leading-7 text-slate-300">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-slate-50">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="SEO Content"
            title="Career guides and blog content built for ranking and learning"
            description="Internal linking from homepage, jobs, blogs, and career guides is ready for SEO scaling."
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog">Read the blog</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {post.category}
              </p>
              <h3 className="mt-3 font-heading text-2xl font-semibold text-slate-50">
                {post.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
