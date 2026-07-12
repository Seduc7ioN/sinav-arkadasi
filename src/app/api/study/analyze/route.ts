import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeMaterial } from "@/lib/ai/study-analyzer"
import { corsResponse, handleCorsPreflight } from "../cors"

export const maxDuration = 60

export async function OPTIONS() {
  return handleCorsPreflight()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return corsResponse({ error: "Unauthorized" }, { status: 401 })
    }

    const { materialId } = await request.json()

    if (!materialId) {
      return corsResponse(
        { error: "materialId gerekli" },
        { status: 400 }
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
        { status: 404 }
      )
    }

    if (material.status === "completed") {
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("*")
        .eq("material_id", materialId)
        .order("created_at", { ascending: true })

      return corsResponse({ questions: existingQuestions, material })
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

      return corsResponse({
        questions: insertedQuestions,
        material: { ...material, status: "completed" },
      })
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
    return corsResponse({ error: message }, { status: 500 })
  }
}
