"use client";

import type { AnalyticsEventPayload } from "@/lib/analytics/events";

const SESSION_STORAGE_KEY = "jobpulse.analytics.session";

function createBrowserSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = createBrowserSessionId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

export async function trackAnalyticsEvent(
  payload: Omit<AnalyticsEventPayload, "userId" | "candidateId" | "employerId" | "paymentId">,
) {
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        sessionId: payload.sessionId ?? getAnalyticsSessionId(),
      }),
      keepalive: true,
    });
  } catch {
    // Analytics should never block the user flow.
  }
}

