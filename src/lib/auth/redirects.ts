import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { UserRole } from "@/types";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      redirect("/admin");
    }

    if (user.role === "employer") {
      redirect("/employer");
    }

    redirect("/dashboard");
  }

  return user;
}

export function getRoleHome(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employer";
  return "/dashboard";
}
