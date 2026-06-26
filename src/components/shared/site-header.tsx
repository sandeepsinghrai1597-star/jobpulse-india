import Image from "next/image";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(10,9,19,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt="JobPulse India logo"
            width={44}
            height={44}
            className="size-11 rounded-2xl object-contain"
            priority
          />
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold text-white">{siteConfig.name}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-cyan-300">
              Find the right job faster with AI.
            </p>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex"
          aria-label="Primary navigation"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Button asChild variant="ghost" className="text-slate-200">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">
              <Sparkles className="size-4" />
              Join JobPulse
            </Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm border-white/10 bg-[#0f0d19] text-white">
            <SheetHeader className="border-b border-white/8 pb-4">
              <SheetTitle className="text-left font-heading text-xl text-white">JobPulse India</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 py-6">
              {primaryNav.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/8"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
            <div className="mt-auto space-y-3 border-t border-white/8 pt-5">
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link href="/signup">
                    <Sparkles className="size-4" />
                    Create account
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
