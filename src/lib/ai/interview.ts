import { z } from "zod";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";

export const interviewRoles = [
  "Data Analyst",
  "Software Developer",
  "Sales Executive",
  "Customer Support",
  "Digital Marketing",
  "Accountant",
  "Banking Fresher",
  "Teacher",
  "BPO",
  "HR Executive",
] as const;

export const interviewModes = [
  "HR interview",
  "Technical interview",
  "Behavioral interview",
  "Fresher interview",
  "Role-specific interview",
] as const;

const questionSchema = z.object({
  question: z.string().trim().min(10),
  focus: z.string().trim().min(2),
  ideal_answer_themes: z.array(z.string().trim().min(1)).min(2).max(5),
});

const evaluationSchema = z.object({
  communication_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  overall_score: z.number().min(0).max(100),
  improved_answer: z.string().trim().min(20),
  improvement_tips: z.array(z.string().trim().min(1)).min(2).max(6),
  weak_areas: z.array(z.string().trim().min(1)).min(1).max(6),
  feedback: z.string().trim().min(20),
});

const reportSchema = z.object({
  communication_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  overall_score: z.number().min(0).max(100),
  weak_areas: z.array(z.string().trim().min(1)).min(1).max(8),
  suggested_practice_questions: z.array(z.string().trim().min(1)).min(3).max(6),
  overall_feedback: z.string().trim().min(20),
});

export type InterviewQuestion = {
  id: string;
  question: string;
  focus: string;
  idealThemes: string[];
  answer?: string;
  evaluation?: InterviewEvaluation;
};

export type InterviewEvaluation = {
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  overallScore: number;
  weakAreas: string[];
  improvementTips: string[];
  betterAnswer: string;
  feedback: string;
};

export type InterviewReport = {
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  overallScore: number;
  weakAreas: string[];
  suggestedPracticeQuestions: string[];
  overallFeedback: string;
};

export async function generateInterviewQuestion({
  role,
  mode,
  previousQuestions,
}: {
  role: string;
  mode: string;
  previousQuestions: string[];
}) {
  const aiResult = await generateStructuredAiResponse("interviewQuestionGenerator", {
    role,
    mode,
    previous_questions: previousQuestions,
    instruction:
      "Return one interview question only. Avoid repeating earlier questions. Keep it realistic for Indian job seekers.",
  });

  const parsed = questionSchema.safeParse(aiResult);
  if (parsed.success) {
    return parsed.data;
  }

  const questionNumber = previousQuestions.length + 1;

  return {
    question: `Question ${questionNumber}: For a ${role} ${mode.toLowerCase()}, how would you answer a realistic interviewer prompt with a concise example from your experience or studies?`,
    focus:
      mode === "Technical interview"
        ? "Role knowledge and practical reasoning"
        : mode === "Behavioral interview"
          ? "Structured storytelling and ownership"
          : "Clarity, relevance, and confidence",
    ideal_answer_themes: [
      "Give a direct answer first",
      "Use one clear example or project",
      "Explain actions and outcomes",
    ],
  };
}

export async function evaluateInterviewAnswer({
  role,
  mode,
  question,
  answer,
}: {
  role: string;
  mode: string;
  question: string;
  answer: string;
}) {
  const aiResult = await generateStructuredAiResponse("interviewAnswerEvaluator", {
    role,
    mode,
    question,
    answer,
    instruction:
      "Score the answer on communication, technical quality, and confidence. Return concise feedback, weak areas, tips, and a stronger sample answer.",
  });

  const parsed = evaluationSchema.safeParse(aiResult);
  if (parsed.success) {
    return mapEvaluation(parsed.data);
  }

  return buildFallbackEvaluation({ role, mode, question, answer });
}

export async function generateInterviewReport({
  role,
  mode,
  transcript,
}: {
  role: string;
  mode: string;
  transcript: InterviewQuestion[];
}) {
  const aiResult = await generateStructuredAiResponse("interviewFinalReportGenerator", {
    role,
    mode,
    transcript: transcript.map((item) => ({
      question: item.question,
      answer: item.answer ?? "",
      evaluation: item.evaluation
        ? {
            communication_score: item.evaluation.communicationScore,
            technical_score: item.evaluation.technicalScore,
            confidence_score: item.evaluation.confidenceScore,
            overall_score: item.evaluation.overallScore,
            weak_areas: item.evaluation.weakAreas,
            improvement_tips: item.evaluation.improvementTips,
          }
        : null,
    })),
    instruction:
      "Generate a practical final report with communication, technical, confidence, and overall score plus weak areas, practice questions, and overall feedback.",
  });

  const parsed = reportSchema.safeParse(aiResult);
  if (parsed.success) {
    return mapReport(parsed.data);
  }

  return buildFallbackReport(transcript, role, mode);
}

function mapEvaluation(data: z.infer<typeof evaluationSchema>): InterviewEvaluation {
  return {
    communicationScore: Math.round(data.communication_score),
    technicalScore: Math.round(data.technical_score),
    confidenceScore: Math.round(data.confidence_score),
    overallScore: Math.round(data.overall_score),
    weakAreas: data.weak_areas,
    improvementTips: data.improvement_tips,
    betterAnswer: data.improved_answer,
    feedback: data.feedback,
  };
}

function mapReport(data: z.infer<typeof reportSchema>): InterviewReport {
  return {
    communicationScore: Math.round(data.communication_score),
    technicalScore: Math.round(data.technical_score),
    confidenceScore: Math.round(data.confidence_score),
    overallScore: Math.round(data.overall_score),
    weakAreas: data.weak_areas,
    suggestedPracticeQuestions: data.suggested_practice_questions,
    overallFeedback: data.overall_feedback,
  };
}

function buildFallbackEvaluation({
  mode,
  answer,
}: {
  role: string;
  mode: string;
  question: string;
  answer: string;
}): InterviewEvaluation {
  const lengthScore = Math.min(100, Math.max(45, Math.round(answer.trim().length / 4)));
  const communicationScore = Math.max(50, Math.min(88, lengthScore));
  const technicalScore =
    mode === "Technical interview"
      ? Math.max(48, Math.min(82, Math.round(lengthScore * 0.92)))
      : Math.max(52, Math.min(84, Math.round(lengthScore * 0.86)));
  const confidenceScore = Math.max(50, Math.min(85, Math.round(lengthScore * 0.88)));
  const overallScore = Math.round(
    (communicationScore + technicalScore + confidenceScore) / 3,
  );

  return {
    communicationScore,
    technicalScore,
    confidenceScore,
    overallScore,
    weakAreas: [
      "Add one sharper example with a clear outcome",
      "Keep the answer more structured from start to finish",
    ],
    improvementTips: [
      "Open with a direct answer before adding detail",
      "Use situation, action, and result instead of broad statements",
      "Quantify impact where possible",
    ],
    betterAnswer:
      "A stronger answer would start with a direct response, explain one relevant example, describe the action taken, and close with the measurable result or learning.",
    feedback:
      "The answer is relevant, but it will sound stronger if you structure it more clearly, use one concrete example, and show the outcome with more confidence.",
  };
}

function buildFallbackReport(
  transcript: InterviewQuestion[],
  role: string,
  mode: string,
): InterviewReport {
  const evaluations = transcript
    .map((item) => item.evaluation)
    .filter(Boolean) as InterviewEvaluation[];

  const average = (values: number[]) =>
    values.length > 0
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;

  const communicationScore = average(evaluations.map((item) => item.communicationScore));
  const technicalScore = average(evaluations.map((item) => item.technicalScore));
  const confidenceScore = average(evaluations.map((item) => item.confidenceScore));
  const overallScore = average(evaluations.map((item) => item.overallScore));
  const weakAreas = Array.from(
    new Set(evaluations.flatMap((item) => item.weakAreas)),
  ).slice(0, 5);

  return {
    communicationScore,
    technicalScore,
    confidenceScore,
    overallScore,
    weakAreas: weakAreas.length > 0 ? weakAreas : ["Answer structure needs more consistency"],
    suggestedPracticeQuestions: [
      `Tell me why you are a fit for this ${role} role.`,
      `What is one challenge you handled in a ${mode.toLowerCase()} setting?`,
      `How would you improve this answer if the interviewer asked for more detail?`,
    ],
    overallFeedback: `Your ${mode.toLowerCase()} practice shows useful potential. Keep tightening structure, add clearer examples, and practice speaking with stronger ownership so your ${role} answers feel more interview-ready.`,
  };
}
