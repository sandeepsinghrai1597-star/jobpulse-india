import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/redirects";
import { runJobFetchScheduler } from "@/server/job-fetcher/scheduler";

export async function GET(request: NextRequest) {
  await requireRole(["admin"]);

  const returnToRaw = request.nextUrl.searchParams.get("returnTo")?.trim() ?? "/admin";
  const returnTo = returnToRaw.startsWith("/admin") ? returnToRaw : "/admin";

  try {
    await runJobFetchScheduler("manual", { autoOnly: true });
  } catch (error) {
    console.error("Admin route run-due-job-sources failed", error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/job-sources");
  revalidatePath("/admin/jobs/sources");
  revalidatePath("/admin/jobs/fetched");

  return NextResponse.redirect(new URL(returnTo, request.url));
}
