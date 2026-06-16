import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.22em] text-primary">404</p>
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
        The page you requested does not exist or may have been moved. Try jobs discovery or return
        to the homepage.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/jobs">Browse jobs</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
