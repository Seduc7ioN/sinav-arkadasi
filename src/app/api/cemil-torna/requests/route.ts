import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { service_type, customer_name, customer_phone, vehicle_brand, vehicle_model, vehicle_year, notes } = body

    if (!service_type || !customer_name || !customer_phone) {
      return NextResponse.json(
        { error: "Hizmet türü, ad soyad ve telefon zorunludur." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        service_type,
        customer_name,
        customer_phone,
        vehicle_brand: vehicle_brand || "",
        vehicle_model: vehicle_model || "",
        vehicle_year: vehicle_year || "",
        notes: notes || "",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
