import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!material) {
      return NextResponse.json(
        { error: "Materyal bulunamadı" },
        { status: 404 }
      )
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("material_id", id)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      material,
      questions: questions || [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
