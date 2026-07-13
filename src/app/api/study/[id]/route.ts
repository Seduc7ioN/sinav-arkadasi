import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service-client"

export const runtime = "nodejs"
import { getUserFromRequest } from "@/lib/supabase/request-auth"
import { corsResponse, handleCorsPreflight } from "../cors"

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
    const supabase = createServiceClient()

    if (!user) {
      return corsResponse({ error: "Yetkisiz" }, { status: 401 }, request)
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
        { status: 404 },
        request
      )
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("material_id", id)
      .order("created_at", { ascending: true })

    return corsResponse(
      { material, questions: questions || [] },
      {},
      request
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return corsResponse({ error: "Yetkisiz" }, { status: 401 }, request)
    }

    const { id } = await params
    const supabase = createServiceClient()

    const { data: material } = await supabase
      .from("study_materials")
      .select("id, storage_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!material) {
      return corsResponse(
        { error: "Materyal bulunamadı" },
        { status: 404 },
        request
      )
    }

    if (material.storage_path) {
      try {
        const url = new URL(material.storage_path)
        const pathParts = url.pathname.split("/")
        const bucketIndex = pathParts.findIndex((p) => p === "study-materials")
        const filePath =
          bucketIndex >= 0 ? pathParts.slice(bucketIndex + 1).join("/") : ""
        if (filePath) {
          await supabase.storage
            .from("study-materials")
            .remove([decodeURIComponent(filePath)])
        }
      } catch (storageError) {
        console.error("[delete material] storage removal failed:", storageError)
      }
    }

    const { error: deleteError } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", id)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    return corsResponse({ success: true }, {}, request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return corsResponse({ error: message }, { status: 500 }, request)
  }
}
