import { inflateRawSync } from "node:zlib";
import { z } from "zod";

const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

function optionalFormText(maxLength: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  }, z.string().max(maxLength).default(""));
}

function optionalUuidField() {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }, z.string().uuid().optional());
}

export const resumeAnalyzerUploadSchema = z.object({
  targetRole: optionalFormText(120),
  jobDescription: optionalFormText(12000),
  resumeId: optionalUuidField(),
});

export interface ResumeAnalysisResult {
  overall_score: number;
  ats_score: number;
  keyword_score: number;
  grammar_score: number;
  formatting_score: number;
  role_match_percentage: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  missing_keywords: string[];
  suggested_skills: string[];
  suggested_improvements: string[];
  improved_summary: string;
  improved_bullets: string[];
  extracted_text: string;
  analyzed_role: string;
  note?: string;
}

export function validateResumeFile(file: File) {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension =
    fileName.endsWith(".pdf") || fileName.endsWith(".docx") || fileName.endsWith(".doc");

  if (!hasAllowedExtension) {
    throw new Error("Upload a PDF or DOCX resume.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    throw new Error("Resume file must be 5 MB or smaller.");
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    throw new Error("Unsupported resume file type. Use PDF or DOCX.");
  }
}

function normalizeExtractedText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractStringsFromPdf(source: string) {
  const matches = Array.from(source.matchAll(/\(([^()]{1,400})\)\s*Tj/g));
  const chunks = matches.map((match) =>
    match[1]
      .replace(/\\\)/g, ")")
      .replace(/\\\(/g, "(")
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " "),
  );

  if (chunks.length > 0) {
    return chunks.join(" ");
  }

  const fallback = source.match(/[A-Za-z0-9][A-Za-z0-9,./()@:%+\- ]{2,}/g) ?? [];
  return fallback.join(" ");
}

function extractPdfText(buffer: Buffer) {
  const raw = buffer.toString("latin1");
  return normalizeExtractedText(extractStringsFromPdf(raw));
}

function readZipEntries(buffer: Buffer) {
  const entries = new Map<string, Buffer>();
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) {
      break;
    }

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraFieldLength = buffer.readUInt16LE(offset + 28);
    const fileName = buffer
      .subarray(offset + 30, offset + 30 + fileNameLength)
      .toString("utf8");

    const dataStart = offset + 30 + fileNameLength + extraFieldLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > buffer.length) {
      break;
    }

    const compressed = buffer.subarray(dataStart, dataEnd);
    const content =
      compressionMethod === 0
        ? compressed
        : compressionMethod === 8
          ? inflateRawSync(compressed)
          : null;

    if (content) {
      entries.set(fileName, content);
    }

    offset = dataEnd;
  }

  return entries;
}

function extractDocxText(buffer: Buffer) {
  const entries = readZipEntries(buffer);
  const documentXml = entries.get("word/document.xml");
  if (!documentXml) {
    return "";
  }

  const text = documentXml
    .toString("utf8")
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<w:tab\/>/g, " ")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return normalizeExtractedText(text);
}

export async function extractResumeText(file: File) {
  validateResumeFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  if (lowerName.endsWith(".docx")) {
    return extractDocxText(buffer);
  }

  throw new Error("DOC format is not supported yet. Please upload PDF or DOCX.");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function uniqueTrimmed(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function buildFallbackResumeAnalysis(input: {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
}): ResumeAnalysisResult {
  const resumeText = input.resumeText;
  const jobDescription = input.jobDescription ?? "";
  const analyzedRole = input.targetRole?.trim() || "Target role";
  const lowerResume = resumeText.toLowerCase();
  const lowerJob = jobDescription.toLowerCase();

  const commonKeywords = uniqueTrimmed(
    lowerJob
      .split(/[^a-z0-9+#.]+/)
      .filter((word) => word.length >= 4),
  ).slice(0, 40);

  const matchedKeywords = commonKeywords.filter((word) => lowerResume.includes(word));
  const missingKeywords = commonKeywords.filter((word) => !lowerResume.includes(word)).slice(0, 10);

  const grammarSignals = [
    resumeText.includes("  ") ? -8 : 0,
    /[.!?]/.test(resumeText) ? 0 : -8,
    /[a-z][A-Z]/.test(resumeText) ? -5 : 0,
  ].reduce((sum, item) => sum + item, 82);

  const formattingSignals = [
    resumeText.length > 800 ? 6 : -8,
    resumeText.includes("\n") ? 4 : -8,
    /experience|education|skills/i.test(resumeText) ? 8 : -10,
  ].reduce((sum, item) => sum + item, 74);

  const keywordScore =
    commonKeywords.length > 0
      ? (matchedKeywords.length / commonKeywords.length) * 100
      : 68;

  const atsScore = (keywordScore * 0.45) + (grammarSignals * 0.2) + (formattingSignals * 0.35);
  const roleMatch = jobDescription
    ? clampScore(keywordScore * 0.75 + 15)
    : clampScore(keywordScore * 0.55 + 25);
  const overall = clampScore((atsScore * 0.65) + (roleMatch * 0.35));

  return {
    overall_score: overall,
    ats_score: clampScore(atsScore),
    keyword_score: clampScore(keywordScore),
    grammar_score: clampScore(grammarSignals),
    formatting_score: clampScore(formattingSignals),
    role_match_percentage: roleMatch,
    strengths: uniqueTrimmed([
      matchedKeywords.length >= 5 ? "Resume already includes several relevant job keywords." : "",
      /experience|education|skills/i.test(resumeText)
        ? "Core resume sections are present for ATS parsing."
        : "",
      resumeText.length > 1200 ? "Resume has enough detail to showcase experience and impact." : "",
    ]).slice(0, 4),
    weaknesses: uniqueTrimmed([
      missingKeywords.length > 0 ? "Some important role-specific keywords are still missing." : "",
      formattingSignals < 75 ? "Formatting structure could be clearer for ATS readability." : "",
      grammarSignals < 75 ? "Sentence consistency and grammar can be tightened." : "",
    ]).slice(0, 4),
    missing_skills: missingKeywords.slice(0, 6),
    missing_keywords: missingKeywords,
    suggested_skills: missingKeywords.slice(0, 6),
    suggested_improvements: uniqueTrimmed([
      "Add more measurable impact in experience bullet points.",
      "Mirror the job description language honestly where it matches your real experience.",
      "Use cleaner section headings and concise bullets for better scan-ability.",
    ]),
    improved_summary: `Results-driven ${analyzedRole} candidate with relevant experience, clear communication, and practical execution skills. Strengthen this summary further by aligning it with the target role's tools, domain language, and measurable achievements.`,
    improved_bullets: [
      "Reworked responsibilities into outcome-focused bullet points with metrics, ownership, and business impact.",
      "Aligned experience descriptions with ATS-friendly keywords from the target role while keeping claims factual.",
      "Improved clarity and readability through shorter action-led bullets and stronger verbs.",
    ],
    extracted_text: resumeText,
    analyzed_role: analyzedRole,
    note: "Fallback analysis generated locally because a structured AI response was unavailable.",
  };
}
