import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);
  return children;
}
