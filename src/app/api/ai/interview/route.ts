import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import {
  evaluateInterviewAnswer,
  generateInterviewQuestion,
  generateInterviewReport,
  interviewModes,
  interviewRoles,
  type InterviewQuestion,
} from "@/lib/ai/interview";
import { createClient } from "@/lib/supabase/server";

const totalQuestions = 3;

const modeSchema = z.enum(interviewModes);
const roleSchema = z.enum(interviewRoles);

const startSchema = z.object({
  action: z.literal("start"),
  role: roleSchema,
  mode: modeSchema,
});

const answerSchema = z.object({
  action: z.literal("answer"),
  sessionId: z.string().uuid().nullable().optional(),
  role: roleSchema,
  mode: modeSchema,
  questionId: z.string().trim().min(1),
  answer: z.string().trim().min(20),
  questions: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        question: z.string().trim().min(10),
        focus: z.string().trim().min(2),
        idealThemes: z.array(z.string().trim().min(1)).min(1),
        answer: z.string().trim().optional(),
        evaluation: z
          .object({
            communicationScore: z.number().min(0).max(100),
            technicalScore: z.number().min(0).max(100),
            confidenceScore: z.number().min(0).max(100),
            overallScore: z.number().min(0).max(100),
            weakAreas: z.array(z.string().trim().min(1)),
            improvementTips: z.array(z.string().trim().min(1)),
            betterAnswer: z.string().trim().min(1),
            feedback: z.string().trim().min(1),
          })
          .optional(),
      }),
    )
    .optional(),
});

const requestSchema = z.discriminatedUnion("action", [startSchema, answerSchema]);

type StoredSessionRow = {
  id: string;
  role: string;
  mode: string;
  questions_json: unknown;
  answers_json: unknown;
  report_json: unknown;
  feedback: string | null;
  score: number | null;
};

export async function POST(request: Request) {
  const rateLimit = checkAiRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid interview request.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    return parsed.data.action === "start"
      ? await handleStart(parsed.data)
      : await handleAnswer(parsed.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not process the interview request.",
      },
      { status: 500 },
    );
  }
}

async function handleStart(input: z.infer<typeof startSchema>) {
  const question = await generateInterviewQuestion({
    role: input.role,
    mode: input.mode,
    previousQuestions: [],
  });

  const firstQuestion: InterviewQuestion = {
    id: randomUUID(),
    question: question.question,
    focus: question.focus,
    idealThemes: question.ideal_answer_themes,
  };

  const storage = await persistNewSession({
    role: input.role,
    mode: input.mode,
    questions: [firstQuestion],
  });

  await recordAnalyticsEvent({
    userId: storage.userId,
    eventName: "interview_session_started",
    sessionId: storage.sessionId ?? undefined,
    eventData: {
      role: input.role,
      mode: input.mode,
      stored: storage.stored,
    },
  });

  return NextResponse.json({
    sessionId: storage.sessionId,
    stored: storage.stored,
    totalQuestions,
    currentQuestionIndex: 0,
    isComplete: false,
    question: firstQuestion,
    questions: [firstQuestion],
    message: storage.message,
  });
}

async function handleAnswer(input: z.infer<typeof answerSchema>) {
  const storage = await loadSession(input.sessionId);
  const questions =
    storage.session?.questions && storage.session.questions.length > 0
      ? storage.session.questions
      : input.questions ?? [];
  const currentQuestion = questions.find((item) => item.id === input.questionId);

  if (!currentQuestion) {
    return NextResponse.json(
      { error: "Interview question not found for this session." },
      { status: 404 },
    );
  }

  const evaluation = await evaluateInterviewAnswer({
    role: input.role,
    mode: input.mode,
    question: currentQuestion.question,
    answer: input.answer,
  });

  const updatedQuestions = questions.map((item) =>
    item.id === input.questionId
      ? {
          ...item,
          answer: input.answer,
          evaluation,
        }
      : item,
  );

  const completedCount = updatedQuestions.filter((item) => item.answer).length;
  const isComplete = completedCount >= totalQuestions;

  if (isComplete) {
    const report = await generateInterviewReport({
      role: input.role,
      mode: input.mode,
      transcript: updatedQuestions,
    });

    await saveSessionState({
      sessionId: storage.sessionId,
      stored: storage.stored,
      questions: updatedQuestions,
      report,
      feedback: report.overallFeedback,
      score: report.overallScore,
    });

    return NextResponse.json({
      sessionId: storage.sessionId,
      stored: storage.stored,
      totalQuestions,
      currentQuestionIndex: totalQuestions,
      isComplete: true,
      question: null,
      evaluation,
      report,
      questions: updatedQuestions,
      message: storage.message,
    });
  }

  const nextQuestionSeed = updatedQuestions.map((item) => item.question);
  const nextQuestionResult = await generateInterviewQuestion({
    role: input.role,
    mode: input.mode,
    previousQuestions: nextQuestionSeed,
  });

  const nextQuestion: InterviewQuestion = {
    id: randomUUID(),
    question: nextQuestionResult.question,
    focus: nextQuestionResult.focus,
    idealThemes: nextQuestionResult.ideal_answer_themes,
  };

  const questionsWithNext = [...updatedQuestions, nextQuestion];

  await saveSessionState({
    sessionId: storage.sessionId,
    stored: storage.stored,
    questions: questionsWithNext,
    answers: questionsWithNext
      .filter((item) => item.answer)
      .map((item) => ({ questionId: item.id, answer: item.answer })),
    feedback: evaluation.feedback,
    score: evaluation.overallScore,
  });

  return NextResponse.json({
    sessionId: storage.sessionId,
    stored: storage.stored,
    totalQuestions,
    currentQuestionIndex: completedCount,
    isComplete: false,
    question: nextQuestion,
    evaluation,
    questions: questionsWithNext,
    message: storage.message,
  });
}

async function persistNewSession({
  role,
  mode,
  questions,
}: {
  role: string;
  mode: string;
  questions: InterviewQuestion[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return {
      sessionId: null,
      stored: false,
      userId: null,
      message: "Practice works without sign-in, but session history is only saved for signed-in users.",
    };
  }

  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      user_id: user.id,
      role,
      mode,
      questions_json: questions,
      answers_json: [],
      report_json: {},
    })
    .select("id")
    .single();

  if (error) {
    return {
      sessionId: null,
      stored: false,
      userId: user.id,
      message: "The interview started, but saving the session history was skipped for this run.",
    };
  }

  return {
    sessionId: data.id,
    stored: true,
    userId: user.id,
    message: "This interview session is being saved to your history.",
  };
}

async function loadSession(sessionId: string | null | undefined) {
  if (!sessionId) {
    return {
      sessionId: null,
      stored: false,
      message: "This practice session is running without saved history.",
      session: {
        questions: [] as InterviewQuestion[],
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("id, role, mode, questions_json, answers_json, report_json, feedback, score")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !data) {
    return {
      sessionId: null,
      stored: false,
      message: "Saved history for this session was not available, so the request could not continue.",
      session: null,
    };
  }

  return {
    sessionId: data.id,
    stored: true,
    message: "This interview session is being saved to your history.",
    session: normalizeStoredSession(data),
  };
}

async function saveSessionState({
  sessionId,
  stored,
  questions,
  answers,
  report,
  feedback,
  score,
}: {
  sessionId: string | null;
  stored: boolean;
  questions: InterviewQuestion[];
  answers?: Array<{ questionId: string; answer: string | undefined }>;
  report?: Record<string, unknown>;
  feedback?: string;
  score?: number;
}) {
  if (!stored || !sessionId) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("interview_sessions")
    .update({
      questions_json: questions,
      answers_json:
        answers ??
        questions
          .filter((item) => item.answer)
          .map((item) => ({ questionId: item.id, answer: item.answer ?? "" })),
      report_json: report ?? {},
      feedback: feedback ?? null,
      score: score ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
}

function normalizeStoredSession(row: StoredSessionRow) {
  const questions = Array.isArray(row.questions_json)
    ? (row.questions_json as InterviewQuestion[])
    : [];

  return {
    ...row,
    questions,
  };
}
