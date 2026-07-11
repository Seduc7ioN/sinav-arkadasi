import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: materials, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Veritabanı hatası: ${error.message}` },
        { status: 500 }
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

    return NextResponse.json({ materials: materialsWithCounts })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
