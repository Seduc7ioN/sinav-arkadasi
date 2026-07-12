import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("shop_status")
      .select("*")
      .eq("id", 1)
      .single()

    if (error) {
      return NextResponse.json({ is_open: true, message: "" })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ is_open: true, message: "" })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

    const body = await request.json()
    const { is_open, message } = body

    const { data, error } = await supabase
      .from("shop_status")
      .upsert({
        id: 1,
        is_open: is_open ?? true,
        message: message ?? "",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
