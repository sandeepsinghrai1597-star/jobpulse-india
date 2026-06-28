"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Loader2,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  CareerAgentContext,
  CareerAgentResponse,
  CareerAgentResultResponse,
} from "@/lib/ai/career-agent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: CareerAgentResultResponse;
};

type ContextDraft = Omit<CareerAgentContext, "skills"> & {
  skillsText: string;
};

const storageKey = "jobpulse-ai-career-agent-chat";

function toDraft(context: Partial<CareerAgentContext>): ContextDraft {
  return {
    education: context.education ?? "",
    skillsText: context.skills?.join(", ") ?? "",
    city: context.city ?? "",
    experience: context.experience ?? "",
    preferredRole: context.preferredRole ?? "",
    salaryExpectation: context.salaryExpectation ?? "",
    resumeText: context.resumeText ?? "",
    notes: context.notes ?? "",
  };
}

function toContext(draft: ContextDraft): CareerAgentContext {
  return {
    education: draft.education,
    skills: draft.skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    city: draft.city,
    experience: draft.experience,
    preferredRole: draft.preferredRole,
    salaryExpectation: draft.salaryExpectation,
    resumeText: draft.resumeText,
    notes: draft.notes,
  };
}

function makeMessage(
  role: StoredMessage["role"],
  content: string,
  result?: CareerAgentResultResponse,
): StoredMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    result,
  };
}

function missingFields(draft: ContextDraft) {
  const fields = [
    ["Education", draft.education],
    ["Skills", draft.skillsText],
    ["City", draft.city],
    ["Experience", draft.experience],
    ["Preferred role", draft.preferredRole],
    ["Salary expectation", draft.salaryExpectation],
  ] as const;

  return fields.filter(([, value]) => !value.trim()).map(([label]) => label);
}

function ResultPanel({ result }: { result: CareerAgentResultResponse }) {
  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-950">
      <section className="space-y-2">
        <p className="text-sm font-semibold text-slate-950">Summary</p>
        <p className="text-sm leading-6 text-muted-foreground">{result.summary}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-semibold">Best roles</p>
          <div className="flex flex-wrap gap-2">
            {result.best_roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-semibold">Missing skills</p>
          <div className="flex flex-wrap gap-2">
            {result.missing_skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold">Matching jobs</p>
        {result.matching_jobs.length > 0 ? (
          <div className="grid gap-3">
            {result.matching_jobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.company_name}
                      {job.city ? ` - ${job.city}` : ""}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/jobs/${job.slug}`}>View job</Link>
                  </Button>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{job.match_reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-muted-foreground">
            No approved database openings matched this profile yet. Browse jobs and keep your profile updated.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="mb-1 text-sm font-semibold">Salary expectation</p>
        <p className="text-sm leading-6 text-muted-foreground">{result.salary_expectation}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-semibold">30-day learning roadmap</p>
          <ol className="space-y-2 text-sm leading-6 text-muted-foreground">
            {result.learning_roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-semibold">Next 7 days</p>
          <ol className="space-y-2 text-sm leading-6 text-muted-foreground">
            {result.next_7_days_action_plan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <Alert>
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>{result.disclaimer}</AlertDescription>
      </Alert>
    </div>
  );
}

export function CareerAgentChat({
  initialContext,
}: {
  initialContext: Partial<CareerAgentContext>;
}) {
  const [contextDraft, setContextDraft] = useState<ContextDraft>(() => toDraft(initialContext));
  const [messages, setMessages] = useState<StoredMessage[]>([
    makeMessage(
      "assistant",
      "Share your career goal and I will map roles, verified job matches, skill gaps, salary guidance, interview prep, resume improvements, and a 7-day plan.",
    ),
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const missing = useMemo(() => missingFields(contextDraft), [contextDraft]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    let frameId = 0;

    try {
      const parsed = JSON.parse(saved) as {
        messages?: StoredMessage[];
        contextDraft?: ContextDraft;
      };
      frameId = window.requestAnimationFrame(() => {
        if (parsed.contextDraft) {
          setContextDraft({ ...toDraft(initialContext), ...parsed.contextDraft });
        }
        if (parsed.messages?.length) {
          setMessages(parsed.messages);
        }
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [initialContext]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ messages, contextDraft }));
  }, [messages, contextDraft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  function updateContext(key: keyof ContextDraft, value: string) {
    setContextDraft((current) => ({ ...current, [key]: value }));
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim() || "Create my AI career plan.";
    const userMessage = makeMessage("user", content);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/career-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: toContext(contextDraft),
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = (await response.json()) as CareerAgentResponse | { error?: unknown };
      if (!response.ok) {
        const errorPayload = data as { error?: unknown };
        throw new Error(
          typeof errorPayload.error === "string"
            ? errorPayload.error
            : "Career agent request failed.",
        );
      }

      if ("type" in data && data.type === "needs_context") {
        setMessages((current) => [...current, makeMessage("assistant", data.message)]);
        return;
      }

      if ("type" in data && data.type === "career_agent_result") {
        setMessages((current) => [
          ...current,
          makeMessage("assistant", "Here is your structured AI career plan.", data),
        ]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] lg:px-8">
      <aside className="space-y-4">
        <div className="space-y-3">
          <Badge className="w-fit">
            <Sparkles className="size-3" />
            AI Career Agent
          </Badge>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Your career plan, grounded in real openings
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The agent asks for missing context first, then uses approved database jobs only when recommending openings.
            </p>
          </div>
        </div>

        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-primary" />
              Career context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={contextDraft.education}
              onChange={(event) => updateContext("education", event.target.value)}
              placeholder="Education"
            />
            <Input
              value={contextDraft.skillsText}
              onChange={(event) => updateContext("skillsText", event.target.value)}
              placeholder="Skills, comma separated"
            />
            <Input
              value={contextDraft.city}
              onChange={(event) => updateContext("city", event.target.value)}
              placeholder="City"
            />
            <Input
              value={contextDraft.experience}
              onChange={(event) => updateContext("experience", event.target.value)}
              placeholder="Experience"
            />
            <Input
              value={contextDraft.preferredRole}
              onChange={(event) => updateContext("preferredRole", event.target.value)}
              placeholder="Preferred role"
            />
            <Input
              value={contextDraft.salaryExpectation}
              onChange={(event) => updateContext("salaryExpectation", event.target.value)}
              placeholder="Salary expectation"
            />
            <Textarea
              value={contextDraft.resumeText}
              onChange={(event) => updateContext("resumeText", event.target.value)}
              placeholder="Paste resume notes for improvement suggestions"
              className="min-h-24"
            />
            <Textarea
              value={contextDraft.notes}
              onChange={(event) => updateContext("notes", event.target.value)}
              placeholder="Anything else the agent should consider"
              className="min-h-20"
            />
            {missing.length > 0 ? (
              <Alert>
                <AlertTitle>Missing context</AlertTitle>
                <AlertDescription>{missing.join(", ")}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTitle>Ready</AlertTitle>
                <AlertDescription>All required context is available for a structured plan.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </aside>

      <section className="flex min-h-[720px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">Career chat</h2>
              <p className="text-xs text-muted-foreground">Guidance, jobs, skills, resume, interviews, salary</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.localStorage.removeItem(storageKey);
              setMessages([
                makeMessage(
                  "assistant",
                  "Share your career goal and I will map roles, verified job matches, skill gaps, salary guidance, interview prep, resume improvements, and a 7-day plan.",
                ),
              ]);
            }}
          >
            Reset
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <p>{message.content}</p>
                {message.result ? <ResultPanel result={message.result} /> : null}
              </div>
            </div>
          ))}
          {isLoading ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Building your plan
              </div>
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <div className="border-t border-slate-200 p-4">
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <form onSubmit={submitMessage} className="border-t border-slate-200 bg-white p-4">
          {messages.length === 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                "I'm a BCA fresher in Delhi — what IT jobs should I apply for?",
                "Compare SSC CGL vs banking exams for a commerce graduate",
                "What skills do I need for a data analyst job in Bangalore?",
                "How do I prepare for a TCS interview in 2 weeks?",
                "What is the salary range for software developers in Pune?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-primary hover:text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for career guidance, resume fixes, interview prep, salary advice, or an action plan"
              className="min-h-16 flex-1"
            />
            <Button type="submit" disabled={isLoading} className="h-auto sm:w-32">
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="size-3" />
              Skill gap
            </span>
            <span className="inline-flex items-center gap-1">
              <BriefcaseBusiness className="size-3" />
              Verified jobs only
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" />
              7-day and 30-day plans
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
