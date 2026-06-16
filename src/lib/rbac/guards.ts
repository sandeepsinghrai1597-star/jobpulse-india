import type { UserRole } from "@/types";

export function canManageJobs(role: UserRole) {
  return role === "employer" || role === "admin";
}

export function canAccessAdmin(role: UserRole) {
  return role === "admin";
}
