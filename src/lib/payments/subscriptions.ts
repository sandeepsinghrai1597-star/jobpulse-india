import type { Json } from "../../../types/database";
import { getPaidPlanDefinition, type PaidPlanId } from "@/lib/payments/plans";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

export interface PaymentRecord {
  id: string;
  user_id: string | null;
  plan: string;
  notes: Json;
  subscription_type: string | null;
}

export function getSubscriptionExpiry(startedAt: Date) {
  const expiresAt = new Date(startedAt);
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  return expiresAt;
}

export function mergePaymentNotes(current: Json, patch: Record<string, Json>) {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...current }
      : {};

  return {
    ...base,
    ...patch,
  } as Record<string, Json>;
}

export async function activateSubscriptionFromPayment(
  admin: AdminClient,
  payment: PaymentRecord,
) {
  if (!payment.user_id) {
    return;
  }

  const planId = payment.plan as PaidPlanId;
  const plan = getPaidPlanDefinition(planId);

  if (!plan) {
    return;
  }

  const activatedAt = new Date();
  const expiresAt = getSubscriptionExpiry(activatedAt);

  const { error: userError } = await admin
    .from("users")
    .update({
      current_plan: plan.id,
      subscription_status: "active",
      subscription_started_at: activatedAt.toISOString(),
      subscription_expires_at: expiresAt.toISOString(),
    } as never)
    .eq("id", payment.user_id);

  if (userError) {
    throw userError;
  }

  const { error: paymentError } = await admin
    .from("payments")
    .update({
      notes: mergePaymentNotes(payment.notes, {
        activated_at: activatedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        billing_interval: plan.billingInterval,
      }),
    } as never)
    .eq("id", payment.id);

  if (paymentError) {
    throw paymentError;
  }
}
