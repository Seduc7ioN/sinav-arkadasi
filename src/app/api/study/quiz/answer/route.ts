import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service-client"
import { getUserFromRequest } from "@/lib/supabase/request-auth"
import { corsResponse, handleCorsPreflight } from "../../cors"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return corsResponse({ error: "Unauthorized" }, { status: 401 }, request)
    }

    const { sessionId, questionId, selectedOption } = await request.json()
    if (!sessionId || !questionId || typeof selectedOption !== "number") {
      return corsResponse(
        { error: "sessionId, questionId ve selectedOption gerekli" },
        { status: 400 },
        request
      )
    }

    const supabase = createServiceClient()

    const { data: session } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .single()

    if (!session) {
      return corsResponse(
        { error: "Aktif quiz oturumu bulunamadı" },
        { status: 404 },
        request
      )
    }

    const { data: question } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .eq("material_id", session.material_id)
      .single()

    if (!question) {
      return corsResponse(
        { error: "Soru bulunamadı" },
        { status: 404 },
        request
      )
    }

    const isCorrect = selectedOption === question.correct_option

    const { data: answer, error: answerError } = await supabase
      .from("quiz_answers")
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct: isCorrect,
        },
        { onConflict: "session_id,question_id" }
      )
      .select("*")
      .single()

    if (answerError || !answer) {
      throw new Error(answerError?.message || "Cevap kaydedilemedi")
    }

    return corsResponse({ answer }, {}, request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
