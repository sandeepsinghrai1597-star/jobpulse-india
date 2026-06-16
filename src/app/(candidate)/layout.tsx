import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/redirects";

export default async function CandidateLayout({ children }: { children: ReactNode }) {
  await requireRole(["candidate"]);
  return children;
}
