import Link from "next/link";
import { BriefcaseBusiness, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getRoleHome } from "@/lib/auth/redirects";
import { siteConfig } from "@/lib/data/site";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold">{siteConfig.name}</p>
            <p className="text-xs text-muted-foreground">{siteConfig.tagline}</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href={getRoleHome(user.role)}>
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/auth/logout">
                  <LogOut className="mr-2 size-4" />
                  Logout
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Button asChild className="rounded-full">
            <Link href="/career-agent">
              <Sparkles className="mr-2 size-4" />
              Try AI Agent
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
