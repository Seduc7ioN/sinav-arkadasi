import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service-client"
import { getUserFromRequest } from "@/lib/supabase/request-auth"
import { corsResponse, handleCorsPreflight } from "../cors"

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    const supabase = createServiceClient()

    if (!user) {
      return corsResponse({ error: "Unauthorized" }, { status: 401 }, request)
    }

    const { data: materials, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return corsResponse(
        { error: `Veritabanı hatası: ${error.message}` },
        { status: 500 },
        request
      )
    }

    const materialIds = materials.map((m) => m.id)
    const { data: questionCounts } = await supabase
      .from("questions")
      .select("material_id")
      .in("material_id", materialIds)

    const countMap = new Map<string, number>()
    questionCounts?.forEach((q) => {
      countMap.set(q.material_id, (countMap.get(q.material_id) || 0) + 1)
    })

    const materialsWithCounts = materials.map((m) => ({
      ...m,
      question_count: countMap.get(m.id) || 0,
    }))

    return corsResponse(
      { materials: materialsWithCounts },
      {},
      request
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
