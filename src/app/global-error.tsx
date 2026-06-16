"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-primary">Application Error</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Something went wrong in JobPulse India
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            The page hit an unexpected error. You can retry this segment or go back to the
            homepage.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button className="rounded-full" onClick={() => unstable_retry()}>
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
