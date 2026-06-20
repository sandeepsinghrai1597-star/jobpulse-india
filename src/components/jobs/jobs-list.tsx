"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Job } from "@/types";
import { JobCard } from "@/components/jobs/job-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JobsList({
  initialResults,
  initialTotal,
  initialPage = 1,
  initialPerPage = 10,
  initialParams = {},
}: {
  initialResults: Job[];
  initialTotal: number;
  initialPage?: number;
  initialPerPage?: number;
  initialParams?: Record<string, string | undefined>;
}) {
  const [jobs, setJobs] = useState<Job[]>(initialResults || []);
  const [total, setTotal] = useState<number>(initialTotal || 0);
  const [page, setPage] = useState<number>(initialPage);
  const [perPage, setPerPage] = useState<number>(initialPerPage);
  const [keyword, setKeyword] = useState(initialParams.keyword ?? "");
  const [city, setCity] = useState(initialParams.city ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(params: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length > 0) qp.set(k, String(v));
      });

      const res = await fetch(`/api/jobs?${qp.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setJobs(json.results ?? []);
      setTotal(json.total ?? 0);
      setPage(json.page ?? 1);
      setPerPage(json.perPage ?? perPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // keep initial data as-is until user interacts
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load({ keyword, city, page: 1, perPage });
        }}
        className="grid items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_auto]"
      >
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, skill, company"
          className="h-11 rounded-xl bg-slate-50"
        />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or location"
          className="h-11 rounded-xl bg-slate-50"
        />
        <Button className="h-11 rounded-xl">Search</Button>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-12">Loading jobs…</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <p className="mb-4">No jobs found. Try broadening your search.</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => { setKeyword(''); setCity(''); load({ page:1, perPage }); }} className="rounded-xl">Clear filters</Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/jobs">Browse all jobs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            const next = Math.max(1, page - 1);
            load({ keyword, city, page: next, perPage });
          }}
          disabled={page <= 1 || loading}
        >
          Prev
        </Button>

        <div className="flex items-center gap-2">
          {(() => {
            const pages: number[] = [];
            const totalPages = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
            const maxButtons = 7;
            let start = Math.max(1, page - Math.floor(maxButtons / 2));
            let end = start + maxButtons - 1;
            if (end > totalPages) {
              end = totalPages;
              start = Math.max(1, end - maxButtons + 1);
            }
            for (let p = start; p <= end; p++) pages.push(p);

            return (
              <>
                {start > 1 && (
                  <Button variant="ghost" onClick={() => load({ keyword, city, page: 1, perPage })} disabled={loading}>
                    1
                  </Button>
                )}
                {start > 2 && <div className="px-2">…</div>}
                {pages.map((p) => (
                  <Button key={p} variant={p === page ? "secondary" : "ghost"} onClick={() => load({ keyword, city, page: p, perPage })} disabled={loading}>
                    {p}
                  </Button>
                ))}
                {end < totalPages - 1 && <div className="px-2">…</div>}
                {end < totalPages && (
                  <Button variant="ghost" onClick={() => load({ keyword, city, page: totalPages, perPage })} disabled={loading}>
                    {totalPages}
                  </Button>
                )}
              </>
            );
          })()}
        </div>

        <div className="text-sm text-muted-foreground">Page {page} of {perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1} • {total} results</div>

        <Button
          variant="ghost"
          onClick={() => {
            const next = page + 1;
            load({ keyword, city, page: next, perPage });
          }}
          disabled={page * perPage >= total || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
