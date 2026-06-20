import { NextResponse } from "next/server";
import { createDocxBuffer, renderResumeHtmlDocument } from "@/lib/resume/export";
import { resumeBuilderSchema } from "@/lib/resume/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resumeBuilderSchema.safeParse(body.resume);

  if (!parsed.success) {
    return NextResponse.json({ message: "Resume data is invalid." }, { status: 400 });
  }

  const format = body.format === "docx" ? "docx" : "pdf";
  const filename = `${parsed.data.title.replaceAll(/\s+/g, "-").toLowerCase() || "resume"}`;

  if (format === "docx") {
    const buffer = createDocxBuffer(parsed.data);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
      },
    });
  }

  return new NextResponse(renderResumeHtmlDocument(parsed.data), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}.html"`,
    },
  });
}
