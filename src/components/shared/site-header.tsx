import Link from "next/link";
import { BriefcaseBusiness, Menu, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/data/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const primaryNav = siteConfig.nav.filter((item) =>
    [
      "/jobs",
      "/learning-roadmap",
      "/resume-builder",
      "/resume-analyzer",
      "/interview-preparation",
      "/pricing",
    ].includes(item.href),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-5 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold leading-5 text-slate-950">{siteConfig.name}</p>
            <p className="text-xs font-medium text-slate-500">Jobs, resumes, interviews</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex" aria-label="Primary navigation">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:text-[#0284c7] before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-full before:origin-left before:scale-x-0 before:rounded-full before:bg-[#0284c7] before:transition-transform before:duration-200 before:content-[''] hover:before:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden border-slate-300 text-slate-800 sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="hidden rounded-lg shadow-sm sm:inline-flex">
            <Link href="/ai-career-agent">
              <Sparkles className="size-4" />
              AI Agent
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm border-slate-200 bg-white">
              <SheetHeader className="border-b border-slate-200">
                <SheetTitle>Explore JobPulse India</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 p-4">
                {primaryNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-primary/30 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-auto space-y-3 border-t border-slate-200 p-4">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href="/ai-career-agent">
                      <Sparkles className="size-4" />
                      AI Agent
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
