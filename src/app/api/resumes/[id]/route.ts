import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeBuilderSchema } from "@/lib/resume/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("id, content_json")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ message: "Resume not found." }, { status: 404 });
  }

  const parsed = resumeBuilderSchema.safeParse({
    ...(typeof data.content_json === "object" && data.content_json ? data.content_json : {}),
    id: data.id,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Saved resume data is invalid." }, { status: 500 });
  }

  return NextResponse.json({ resume: parsed.data });
}
