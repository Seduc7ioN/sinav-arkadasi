import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { corsResponse, handleCorsPreflight } from "../cors"

const VALID_TYPES = new Map([
  ["image/jpeg", "image"],
  ["image/png", "image"],
  ["image/webp", "image"],
  ["application/pdf", "pdf"],
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "ppt",
  ],
  ["application/vnd.ms-powerpoint", "ppt"],
])

const MAX_SIZE = 20 * 1024 * 1024

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

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return corsResponse({ error: "Dosya gerekli" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return corsResponse(
        { error: "Dosya boyutu 20MB'dan büyük olamaz" },
        { status: 400 }
      )
    }

    const fileType = VALID_TYPES.get(file.type)
    if (!fileType) {
      return corsResponse(
        {
          error:
            "Desteklenmeyen dosya formatı. Lütfen JPEG, PNG, PDF veya PPT yükleyin",
        },
        { status: 400 }
      )
    }

    const title =
      (formData.get("title") as string) || file.name.replace(/\.[^/.]+$/, "")

    const fileExt = file.name.split(".").pop() || "bin"
    const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return corsResponse(
        { error: `Dosya yükleme hatası: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("study-materials").getPublicUrl(storagePath)

    const { data: material, error: dbError } = await supabase
      .from("study_materials")
      .insert({
        user_id: user.id,
        title,
        file_type: fileType,
        storage_path: publicUrl,
        status: "uploaded",
      })
      .select("*")
      .single()

    if (dbError) {
      return corsResponse(
        { error: `Veritabanı hatası: ${dbError.message}` },
        { status: 500 }
      )
    }

    return corsResponse({ material })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 })
  }
}
