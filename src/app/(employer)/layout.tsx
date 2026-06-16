import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/redirects";

export default async function EmployerLayout({ children }: { children: ReactNode }) {
  await requireRole(["employer", "admin"]);
  return children;
}
