"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, PauseCircle, PlayCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmployerJobActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "pause" | "resume" | "feature" | "delete") {
    const deleting = action === "delete";
    if (deleting && !window.confirm("Delete this job permanently?")) {
      return;
    }

    setError(null);
    setIsBusy(action);
    const response = await fetch(`/api/employer/jobs/${jobId}`, {
      method: deleting ? "DELETE" : "PATCH",
      headers: deleting ? undefined : { "Content-Type": "application/json" },
      body: deleting ? undefined : JSON.stringify({ action }),
    });

    const result = (await response.json()) as { message?: string };
    setIsBusy(null);

    if (!response.ok) {
      setError(result.message ?? "Action failed.");
      return;
    }

    router.refresh();
  }

  const paused = status === "draft";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/employer/jobs/${jobId}/edit`}>
            <Edit3 className="size-4" />
            Edit
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(isBusy)}
          onClick={() => run(paused ? "resume" : "pause")}
        >
          {paused ? <PlayCircle className="size-4" /> : <PauseCircle className="size-4" />}
          {isBusy === "pause" || isBusy === "resume" ? "Saving..." : paused ? "Resume" : "Pause"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={Boolean(isBusy)}
          onClick={() => run("feature")}
        >
          <Star className="size-4" />
          Feature
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          disabled={Boolean(isBusy)}
          onClick={() => run("delete")}
          aria-label="Delete job"
          title="Delete job"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
