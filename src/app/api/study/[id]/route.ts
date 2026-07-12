import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { corsResponse, handleCorsPreflight } from "../cors"

export async function OPTIONS(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleCorsPreflight()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return corsResponse({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!material) {
      return corsResponse(
        { error: "Materyal bulunamadı" },
        { status: 404 }
      )
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("material_id", id)
      .order("created_at", { ascending: true })

    return corsResponse({
      material,
      questions: questions || [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 })
  }
}
