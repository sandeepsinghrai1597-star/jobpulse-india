import Link from "next/link";
import { approveFetchedJobAction, rejectFetchedJobAction } from "@/app/(admin)/admin/jobs/ingestion-actions";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getClient() {
  return getSupabaseAdminClient() ?? (await createClient());
}

function formatDate(value: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function dedupeLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function AdminFetchedJobsPage() {
  const client = await getClient();
  const { data: items } = await client
    .from("job_ingestion_items")
    .select(
      "id, title, company_name, city, state, source_type, source_url, application_url, dedupe_status, review_status, review_notes, created_at, description, skills, published_job_id",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const pendingCount = (items ?? []).filter((item) => item.review_status === "pending_review").length;
  const publishedCount = (items ?? []).filter((item) => item.review_status === "published").length;

  return (
    <DashboardShell
      role="admin"
      title="Fetched jobs review queue"
      description="Review normalized jobs from automated sources, reject duplicates or low-quality intake, and publish approved items into the public `jobs` table."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Pending review</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Published from fetch</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{publishedCount}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5">
            <CardContent className="flex h-full items-center justify-between gap-3 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Source controls</p>
                <p className="mt-2 text-sm text-slate-600">Need to pause, add, or run a source?</p>
              </div>
              <Button asChild variant="outline" className="rounded-2xl border-slate-200 bg-white">
                <Link href="/admin/job-sources">Manage sources</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5">
          <CardHeader className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(59,130,246,0.03)_60%,rgba(255,255,255,0.96)_100%)]">
            <CardTitle>Review queue</CardTitle>
            <CardDescription>Every item below is staged outside the public jobs list until an admin approves it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {(items ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                No fetched jobs yet.
              </div>
            ) : (
              (items ?? []).map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                        <Badge variant={item.review_status === "published" ? "default" : "secondary"}>{item.review_status}</Badge>
                        <Badge variant={item.dedupe_status === "new" ? "outline" : "destructive"}>{dedupeLabel(item.dedupe_status)}</Badge>
                        <Badge variant="outline">{item.source_type}</Badge>
                      </div>
                      <p className="text-sm text-slate-700">{item.company_name}</p>
                      <p className="text-sm text-slate-500">{[item.city, item.state].filter(Boolean).join(", ") || "India"}</p>
                      <p className="line-clamp-3 max-w-4xl text-sm text-slate-600">{item.description}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>Fetched: {formatDate(item.created_at)}</p>
                      {item.published_job_id ? <p className="mt-1">Published job linked</p> : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Source URL</p>
                      <p className="mt-2 break-all text-sm text-slate-700">{item.source_url}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Application URL</p>
                      <p className="mt-2 break-all text-sm text-slate-700">{item.application_url || "--"}</p>
                    </div>
                  </div>

                  {Array.isArray(item.skills) && item.skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.skills.slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  ) : null}

                  {item.review_notes ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      {item.review_notes}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.review_status !== "published" ? (
                      <form action={approveFetchedJobAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="returnTo" value="/admin/jobs/fetched" />
                        <input type="hidden" name="reviewNotes" value={item.dedupe_status === "new" ? "Approved from fetched queue." : "Approved after duplicate review."} />
                        <Button size="sm" className="rounded-xl">Approve and publish</Button>
                      </form>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-300 bg-white">
                        <Link href="/admin/jobs/review">Open published jobs</Link>
                      </Button>
                    )}

                    {item.review_status !== "published" ? (
                      <form action={rejectFetchedJobAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="returnTo" value="/admin/jobs/fetched" />
                        <input type="hidden" name="reviewNotes" value="Rejected during fetched-jobs review." />
                        <Button size="sm" variant="destructive" className="rounded-xl">Reject</Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
