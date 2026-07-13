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

    const { materialId } = await request.json()
    if (typeof materialId !== "string" || materialId.trim().length === 0) {
      return corsResponse(
        { error: "materialId gerekli" },
        { status: 400 },
        request
      )
    }

    const supabase = createServiceClient()

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", materialId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single()

    if (!material) {
      return corsResponse(
        { error: "Materyal bulunamadı veya henüz işlenmemiş" },
        { status: 404 },
        request
      )
    }

    const { data: existingSession } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("material_id", materialId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (existingSession) {
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("material_id", materialId)
        .order("created_at", { ascending: true })

      return corsResponse(
        { session: existingSession, questions: questions || [] },
        {},
        request
      )
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("material_id", materialId)
      .order("created_at", { ascending: true })

    const total = questions?.length || 0

    const { data: session, error: sessionError } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        material_id: materialId,
        score: 0,
        total,
        status: "in_progress",
      })
      .select("*")
      .single()

    if (sessionError) {
      if (sessionError.code === "23505") {
        const { data: existingSessionOnConflict } = await supabase
          .from("quiz_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("material_id", materialId)
          .eq("status", "in_progress")
          .maybeSingle()

        if (existingSessionOnConflict) {
          return corsResponse(
            { session: existingSessionOnConflict, questions: questions || [] },
            {},
            request
          )
        }
      }

      throw new Error(sessionError.message)
    }

    if (!session) {
      throw new Error("Oturum oluşturulamadı")
    }

    return corsResponse(
      { session, questions: questions || [] },
      {},
      request
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
