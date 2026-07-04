import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ai } from "@/lib/ai/client"

export async function POST(request: Request) {
  try {
    const { projectId, type } = await request.json()

    if (!projectId || !type) {
      return NextResponse.json(
        { error: "projectId and type are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (!project.original_image) {
      return NextResponse.json(
        { error: "No product image found. Please upload an image first." },
        { status: 400 }
      )
    }

    await supabase
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId)

    const startTime = Date.now()
    let result

    switch (type) {
      case "remove_bg": {
        result = await ai.removeBackground(project.original_image)
        if (result.url && result.url !== project.original_image) {
          await supabase.from("project_images").insert({
            project_id: projectId,
            type: "white_bg",
            url: result.url,
            width: result.width || null,
            height: result.height || null,
          })
        }
        break
      }
      case "gen_bg": {
        result = await ai.generateBackground(project.original_image)
        if (result.url && result.url !== project.original_image) {
          await supabase.from("project_images").insert({
            project_id: projectId,
            type: "ai_background",
            url: result.url,
            width: result.width || null,
            height: result.height || null,
          })
        }
        break
      }
      case "enhance": {
        result = await ai.enhanceImage(project.original_image)
        if (result.url && result.url !== project.original_image) {
          await supabase.from("project_images").insert({
            project_id: projectId,
            type: "enhanced",
            url: result.url,
            width: result.width || null,
            height: result.height || null,
          })
        }
        break
      }
      case "gen_description": {
        result = await ai.generateDescription({
          productName: project.title,
          category: project.title,
        })
        if (result.content) {
          await supabase.from("project_content").insert({
            project_id: projectId,
            type: "description",
            content: result.content,
          })
        }
        break
      }
      case "gen_keywords": {
        const { data: desc } = await supabase
          .from("project_content")
          .select("content")
          .eq("project_id", projectId)
          .eq("type", "description")
          .maybeSingle()

        result = await ai.generateKeywords({
          productName: project.title,
          description: desc?.content || project.title,
        })
        if (result.content) {
          await supabase.from("project_content").insert({
            project_id: projectId,
            type: "keywords",
            content: result.content,
          })
        }
        break
      }
      case "gen_seo": {
        const { data: desc } = await supabase
          .from("project_content")
          .select("content")
          .eq("project_id", projectId)
          .eq("type", "description")
          .maybeSingle()

        const { data: keywords } = await supabase
          .from("project_content")
          .select("content")
          .eq("project_id", projectId)
          .eq("type", "keywords")
          .maybeSingle()

        result = await ai.generateSeoContent({
          productName: project.title,
          description: desc?.content || project.title,
          keywords: keywords?.content?.split(",").map((k: string) => k.trim()) || [],
        })
        if (result.content) {
          await supabase.from("project_content").insert({
            project_id: projectId,
            type: "seo_description",
            content: result.content,
          })
        }
        break
      }
      default:
        return NextResponse.json(
          { error: `Unknown AI action type: ${type}` },
          { status: 400 }
        )
    }

    const duration = Date.now() - startTime

    await supabase.from("ai_jobs").insert({
      project_id: projectId,
      type,
      provider: "auto",
      status: "completed",
      output: result,
      duration_ms: duration,
      completed_at: new Date().toISOString(),
    })

    await supabase
      .from("projects")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", projectId)

    return NextResponse.json({
      success: true,
      result,
      duration,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
