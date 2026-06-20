import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { employerProfileSchema } from "@/lib/validation/schemas";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = employerProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Please fix the profile details and try again." },
      { status: 400 },
    );
  }

  const payload = {
    user_id: user.id,
    company_name: parsed.data.companyName,
    website: parsed.data.website,
    company_email: parsed.data.companyEmail,
    company_email_verified: parsed.data.companyEmail.endsWith(`@${new URL(parsed.data.website).hostname.replace(/^www\./, "")}`),
    domain_verification_status: "pending",
    industry: parsed.data.industry,
    city: parsed.data.city,
    state: parsed.data.state,
    logo_url: parsed.data.logoUrl || null,
    recruiter_name: parsed.data.recruiterName,
    recruiter_phone: parsed.data.recruiterPhone,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("employer_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("id, company_name, company_email, company_email_verified, domain_verification_status, website, industry, city, state, logo_url, recruiter_name, recruiter_phone, verified, approval_status, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ message: "We could not save your employer profile right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: data, message: "Employer profile saved successfully." });
}
