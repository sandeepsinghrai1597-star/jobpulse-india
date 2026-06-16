import { cache } from "react";
import type { UserRole } from "@/types";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string | null;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, email, role, name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    const derivedRole = user.user_metadata?.role;
    const role: UserRole =
      derivedRole === "admin" || derivedRole === "employer" || derivedRole === "candidate"
        ? derivedRole
        : "candidate";

    return {
      id: user.id,
      email: user.email,
      role,
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email.split("@")[0] ??
        "User",
      phone:
        typeof user.phone === "string" && user.phone.length > 0 ? user.phone : null,
    };
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    name: data.name,
    phone: data.phone,
  };
});
