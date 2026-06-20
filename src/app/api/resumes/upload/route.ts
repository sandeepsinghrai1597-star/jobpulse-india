import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

const RESUME_BUCKET = "candidate-resumes";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { message: "Please sign in to upload a resume." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const requestedTitle = String(formData.get("title") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Choose a resume file to upload." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Upload a PDF, DOC, or DOCX resume." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { message: "Resume files must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const filePath = `${user.id}/${randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { message: "We could not upload this resume right now." },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(filePath);
  const title = requestedTitle || file.name.replace(/\.[^.]+$/, "") || "Uploaded resume";

  const { data: resume, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      file_url: publicUrlData.publicUrl,
      template_key: "uploaded",
    } as never)
    .select("id, title, file_url, updated_at")
    .single();

  if (insertError || !resume?.id) {
    return NextResponse.json(
      { message: "Your resume uploaded, but we could not save it to your library." },
      { status: 500 },
    );
  }

  await recordAnalyticsEvent({
    userId: user.id,
    eventName: "resume_upload",
    eventData: {
      resumeId: resume.id,
      title,
      source: "job-application",
    },
  });

  return NextResponse.json({
    ok: true,
    resume: {
      id: resume.id,
      title: resume.title,
      fileUrl: resume.file_url,
      updatedAt: resume.updated_at,
    },
    uploadedResumeUrl: resume.file_url,
  });
}
