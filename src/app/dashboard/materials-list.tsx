"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileText, ImageIcon, Presentation, Loader2, Sparkles, AlertCircle, CheckCircle2, Play } from "lucide-react"
import type { StudyMaterial } from "@/types"

function getFileIcon(type: string) {
  if (type === "pdf") return <FileText className="h-5 w-5" />
  if (type === "ppt") return <Presentation className="h-5 w-5" />
  return <ImageIcon className="h-5 w-5" />
}

function StatusBadge({ status, errorMessage }: { status: StudyMaterial["status"]; errorMessage: string | null }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Hazır
      </span>
    )
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        İşleniyor
      </span>
    )
  }
  if (status === "failed") {
    return (
      <span
        title={errorMessage || "İşlem başarısız"}
        className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
      >
        <AlertCircle className="h-3 w-3" />
        Hata
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
      Yüklendi
    </span>
  )
}

export function MaterialsList({ materials }: { materials: StudyMaterial[] }) {
  const router = useRouter()
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (materialId: string) => {
    setAnalyzingId(materialId)
    setError(null)

    try {
      const res = await fetch("/api/study/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      })

      const rawBody = await res.text()
      let data: { error?: string } = {}
      try {
        data = JSON.parse(rawBody)
      } catch {
        // JSON değilse ham yanıtı göster
      }

      if (!res.ok) {
        const message =
          data.error ||
          (rawBody ? rawBody.slice(0, 300) : `HTTP ${res.status}`)
        throw new Error(message)
      }

      router.push(`/dashboard/materials/${materialId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Soru oluşturulurken bir hata oluştu")
      setAnalyzingId(null)
    }
  }

  if (materials.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">Henüz bir materyal yüklemedin.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Yukarıdaki "Not Yükle" butonu ile ilk notunu ekle.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {materials.map((material) => (
        <div
          key={material.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {getFileIcon(material.file_type)}
            </div>
            <div>
              <h3 className="font-medium">{material.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={material.status} errorMessage={material.error_message} />
                <span>·</span>
                <span>{material.question_count || 0} soru</span>
                <span>·</span>
                <span>{new Date(material.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {material.status === "completed" ? (
              <>
                <Link
                  href={`/dashboard/materials/${material.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Soruları Gör
                </Link>
                <Link
                  href={`/dashboard/quiz/${material.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Quiz Başlat
                </Link>
              </>
            ) : material.status === "uploaded" || material.status === "failed" ? (
              <button
                onClick={() => handleAnalyze(material.id)}
                disabled={analyzingId === material.id}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {analyzingId === material.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Soru Oluştur
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
