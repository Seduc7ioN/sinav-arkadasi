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

    const { sessionId } = await request.json()
    if (!sessionId) {
      return corsResponse(
        { error: "sessionId gerekli" },
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

    const { data: allQuestions } = await supabase
      .from("questions")
      .select("id, correct_option")
      .eq("material_id", session.material_id)

    const { data: existingAnswers } = await supabase
      .from("quiz_answers")
      .select("*")
      .eq("session_id", sessionId)

    const answersToInsert = (allQuestions || [])
      .filter(
        (q) =>
          !existingAnswers?.find(
            (a) => a.question_id === q.id
          )
      )
      .map((q) => ({
        session_id: sessionId,
        question_id: q.id,
        selected_option: null,
        is_correct: false,
      }))

    if (answersToInsert.length > 0) {
      await supabase.from("quiz_answers").insert(answersToInsert)
    }

    const { data: finalAnswers } = await supabase
      .from("quiz_answers")
      .select("is_correct")
      .eq("session_id", sessionId)

    const score = finalAnswers?.filter((a) => a.is_correct).length || 0
    const total = finalAnswers?.length || session.total

    const { data: updatedSession, error: updateError } = await supabase
      .from("quiz_sessions")
      .update({
        score,
        total,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select("*")
      .single()

    if (updateError || !updatedSession) {
      throw new Error(updateError?.message || "Oturum tamamlanamadı")
    }

    return corsResponse({ session: updatedSession }, {}, request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
