import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service-client"

export const runtime = "nodejs"
import { getUserFromRequest } from "@/lib/supabase/request-auth"
import { analyzeMaterial } from "@/lib/ai/study-analyzer"
import { corsResponse, handleCorsPreflight } from "../cors"

export const maxDuration = 60

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    const supabase = createServiceClient()

    if (!user) {
      return corsResponse({ error: "Unauthorized" }, { status: 401 }, request)
    }

    const { materialId } = await request.json()

    if (!materialId) {
      return corsResponse(
        { error: "materialId gerekli" },
        { status: 400 },
        request
      )
    }

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", materialId)
      .eq("user_id", user.id)
      .single()

    if (!material) {
      return corsResponse(
        { error: "Materyal bulunamadı" },
        { status: 404 },
        request
      )
    }

    if (material.status === "completed") {
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("*")
        .eq("material_id", materialId)
        .order("created_at", { ascending: true })

      return corsResponse(
        { questions: existingQuestions, material },
        {},
        request
      )
    }

    await supabase
      .from("study_materials")
      .update({ status: "processing" })
      .eq("id", materialId)

    try {
      const result = await analyzeMaterial(
        material.storage_path,
        material.file_type
      )

      const questions = result.questions.map((q) => ({
        material_id: materialId,
        question_text: q.question_text,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }))

      const { data: insertedQuestions, error: insertError } = await supabase
        .from("questions")
        .insert(questions)
        .select("*")

      if (insertError) {
        throw new Error(`Soru kaydetme hatası: ${insertError.message}`)
      }

      await supabase
        .from("study_materials")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", materialId)

      return corsResponse(
        {
          questions: insertedQuestions,
          material: { ...material, status: "completed" },
        },
        {},
        request
      )
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Analiz başarısız"

      await supabase
        .from("study_materials")
        .update({ status: "failed", error_message: message })
        .eq("id", materialId)

      throw analysisError
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
