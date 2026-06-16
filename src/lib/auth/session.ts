import type { UserRole } from "@/types";

export function getDemoRole(searchParams?: Record<string, string | string[] | undefined>) {
  const role = typeof searchParams?.role === "string" ? searchParams.role : "candidate";
  if (role === "admin" || role === "employer" || role === "candidate") {
    return role as UserRole;
  }
  return "candidate" as const;
}
