import { NextResponse } from "next/server";
import { getEmployerAccess } from "@/lib/employer/access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedApplicationStatuses = new Set([
  "applied",
  "viewed",
  "shortlisted",
  "interview",
  "rejected",
  "offered",
]);

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await getEmployerAccess();

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const body = await request.json();
  const status = String(body.status ?? "");

  if (!allowedApplicationStatuses.has(status)) {
    return NextResponse.json({ message: "Choose a valid applicant status." }, { status: 400 });
  }

  const { data: application, error: lookupError } = await access.admin
    .from("applications")
    .select("id, job_id, jobs!inner(id, employer_id)")
    .eq("id", id)
    .eq("jobs.employer_id", access.employerProfileId)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ message: "We could not verify this application." }, { status: 500 });
  }

  if (!application) {
    return NextResponse.json(
      { message: "Application not found, or you do not have permission to update it." },
      { status: 404 },
    );
  }

  const { error } = await access.admin
    .from("applications")
    .update({
      status,
      employer_notes: typeof body.note === "string" ? body.note.trim() || null : undefined,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: "We could not update this applicant." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Applicant status updated." });
}
