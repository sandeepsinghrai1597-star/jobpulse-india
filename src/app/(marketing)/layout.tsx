import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="jp-shell flex-1 jp-bottom-safe">{children}</main>
      <SiteFooter />
    </>
  );
}
