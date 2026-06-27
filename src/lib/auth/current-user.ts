import { cache } from "react";
import type { UserRole } from "@/types";
import { getRoleFromAuthMetadata } from "@/lib/auth/auth-errors";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string | null;
  currentPlan?: string | null;
  subscriptionStatus?: "active" | "paused" | "unsubscribed" | null;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  let user: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"];

  try {
    supabase = await createClient();
    const response = await supabase.auth.getUser();
    user = response.data.user;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }

    console.error("[auth] unable to resolve current user", error);
    return null;
  }

  if (!user?.id || !user.email) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, email, role, name, phone, current_plan, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      email: user.email,
      role: getRoleFromAuthMetadata(
        user.app_metadata?.role,
        user.user_metadata?.role,
      ),
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email.split("@")[0] ??
        "User",
      phone:
        typeof user.phone === "string" && user.phone.length > 0 ? user.phone : null,
      currentPlan: null,
      subscriptionStatus: null,
    };
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    name: data.name,
    phone: data.phone,
    currentPlan: data.current_plan,
    subscriptionStatus: data.subscription_status,
  };
});

function isDynamicServerError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}
