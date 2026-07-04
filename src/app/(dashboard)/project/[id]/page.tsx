"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Download,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  FileText,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Project, ProjectImage, ProjectContent } from "@/types"

const ACTION_LABELS: Record<string, string> = {
  remove_bg: "Arka Planı Kaldır",
  white_bg: "Beyaz Arka Plan",
  transparent: "Transparan PNG",
  gen_bg: "AI Arka Plan",
  shadow: "Gölge Ekle",
  enhance: "Görseli İyileştir",
  gen_description: "Açıklama Oluştur",
  gen_keywords: "Anahtar Kelimeler",
  gen_seo: "SEO İçeriği",
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [contents, setContents] = useState<ProjectContent[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadProject = useCallback(async () => {
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()

    if (!project) {
      router.push("/projects")
      return
    }

    setProject(project)

    const { data: images } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", id)

    const { data: contents } = await supabase
      .from("project_content")
      .select("*")
      .eq("project_id", id)

    if (images) setImages(images)
    if (contents) setContents(contents)
    setLoading(false)
    setError(null)
  }, [id, supabase, router])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  useEffect(() => {
    if (project?.status !== "processing") return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("projects")
        .select("status")
        .eq("id", id)
        .single()

      if (data?.status === "completed" || data?.status === "failed") {
        clearInterval(interval)
        loadProject()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [project?.status, id, supabase, loadProject])

  async function handleAIAction(type: string) {
    setProcessing(type)
    setError(null)

    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, type }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "AI işleme başarısız oldu")
      }

      toast.success("AI işleme tamamlandı")
      await loadProject()
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI işleme başarısız oldu"
      setError(message)
      toast.error(message)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(project.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>
        <Badge
          variant={
            project.status === "completed"
              ? "default"
              : project.status === "processing"
              ? "secondary"
              : project.status === "failed"
              ? "destructive"
              : "outline"
          }
        >
          {project.status === "draft" && "Taslak"}
          {project.status === "processing" && "İşleniyor"}
          {project.status === "completed" && "Tamamlandı"}
          {project.status === "failed" && "Hata"}
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">İşlem Hatası</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="photos" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Fotoğraflar
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    İçerik
                  </TabsTrigger>
                  <TabsTrigger value="export" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Dışa Aktar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photos" className="space-y-4">
                  {project.original_image && (
                    <div>
                      <p className="text-sm font-medium mb-2">Orijinal</p>
                      <div className="aspect-square max-w-sm rounded-lg overflow-hidden bg-muted">
                        <img
                          src={project.original_image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        AI Tarafından Oluşturulan Görseller
                      </p>
                      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className="group relative aspect-square rounded-lg overflow-hidden bg-muted border"
                          >
                            <img
                              src={image.url}
                              alt={image.type}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => window.open(image.url, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge className="absolute top-2 left-2 capitalize text-xs">
                              {image.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleAIAction("remove_bg")}
                      disabled={processing !== null}
                    >
                      {processing === "remove_bg" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Arka Planı Kaldır
                    </Button>
                    <Button
                      onClick={() => handleAIAction("gen_bg")}
                      disabled={processing !== null}
                      variant="outline"
                    >
                      {processing === "gen_bg" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      AI Arka Plan
                    </Button>
                    <Button
                      onClick={() => handleAIAction("enhance")}
                      disabled={processing !== null}
                      variant="outline"
                    >
                      {processing === "enhance" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Görseli İyileştir
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  {contents.length > 0 ? (
                    contents.map((content) => (
                      <Card key={content.id}>
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2 capitalize">
                            {content.type.replace(/_/g, " ")}
                          </Badge>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {content.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground mb-4">
                        Henüz içerik oluşturulmadı
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          onClick={() => handleAIAction("gen_description")}
                          disabled={processing !== null}
                        >
                          {processing === "gen_description" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Açıklama Oluştur
                        </Button>
                        <Button
                          onClick={() => handleAIAction("gen_keywords")}
                          disabled={processing !== null}
                          variant="outline"
                        >
                          {processing === "gen_keywords" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Anahtar Kelimeler
                        </Button>
                        <Button
                          onClick={() => handleAIAction("gen_seo")}
                          disabled={processing !== null}
                          variant="outline"
                        >
                          {processing === "gen_seo" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          SEO İçeriği
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="export" className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {["PNG", "JPG", "High Resolution"].map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        className="h-20 flex-col gap-1"
                      >
                        <Download className="h-5 w-5" />
                        <span className="text-xs">{format}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">
                      Pazaryeri Dışa Aktar
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {["Trendyol", "Amazon", "Etsy", "Shopify", "Hepsiburada"].map(
                        (marketplace) => (
                          <Button
                            key={marketplace}
                            variant="outline"
                            className="h-12"
                            disabled
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {marketplace}
                          </Button>
                        )
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Pazaryeri dışa aktarma yakında gelecek
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">AI İşlemleri</h3>
              <div className="space-y-1">
                {Object.entries(ACTION_LABELS).map(([type, label]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handleAIAction(type)}
                    disabled={processing !== null}
                  >
                    {processing === type ? (
                      <Loader2 className="mr-2 h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    )}
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {project.status === "processing" && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm font-medium">AI işleme devam ediyor...</p>
                <p className="text-xs text-muted-foreground">
                  Bu işlem birkaç saniye sürebilir
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
