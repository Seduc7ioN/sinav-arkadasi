import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service-client"
import { getUserFromRequest } from "@/lib/supabase/request-auth"
import { corsResponse, handleCorsPreflight } from "../../../cors"

export const runtime = "nodejs"

export async function OPTIONS(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleCorsPreflight(request)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return corsResponse({ error: "Unauthorized" }, { status: 401 }, request)
    }

    const { id } = await params
    const supabase = createServiceClient()

    const { data: session } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single()

    if (!session) {
      return corsResponse(
        { error: "Oturum bulunamadı veya henüz tamamlanmamış" },
        { status: 404 },
        request
      )
    }

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", session.material_id)
      .single()

    const { data: answers } = await supabase
      .from("quiz_answers")
      .select("*, question:questions(*)")
      .eq("session_id", id)

    return corsResponse(
      { session, material, answers: answers || [] },
      {},
      request
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
