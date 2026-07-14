"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Sparkles, Play, Trash2, RotateCcw, UploadCloud } from "lucide-react"
import { StatusBadge, getFileIconSmall } from "@/components/material-helpers"
import { Button } from "@/components/ui/button"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import type { StudyMaterial } from "@/types"

export function MaterialsList({ materials }: { materials: StudyMaterial[] }) {
  const router = useRouter()
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
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

  const handleDelete = async (materialId: string) => {
    setDeletingId(materialId)
    setError(null)

    try {
      const res = await fetch(`/api/study/${materialId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Materyal silinirken bir hata oluştu")
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Materyal silinirken bir hata oluştu")
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  if (materials.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold">Henüz bir materyal yüklemedin</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ders notu, slayt veya fotoğraf yükle; yapay zeka sana özel sorular oluştursun.
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
              {getFileIconSmall(material.file_type)}
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
                <Button asChild size="sm">
                  <Link href={`/dashboard/materials/${material.id}`}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Soruları Gör
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/quiz/${material.id}`}>
                    <Play className="mr-2 h-4 w-4" />
                    Quiz Başlat
                  </Link>
                </Button>
              </>
            ) : material.status === "uploaded" || material.status === "failed" || material.status === "processing" ? (
              <Button
                size="sm"
                onClick={() => handleAnalyze(material.id)}
                disabled={analyzingId === material.id}
              >
                {analyzingId === material.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : material.status === "processing" ? (
                  <RotateCcw className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {material.status === "processing" ? "Tekrar Dene" : "Soru Oluştur"}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmId(material.id)}
              disabled={deletingId === material.id || analyzingId === material.id}
            >
              {deletingId === material.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Sil
            </Button>
          </div>
        </div>
      ))}

      <DeleteConfirmationDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Materyali silmek istediğine emin misin?"
        description="Bu işlem geri alınamaz. Materyale ait tüm sorular ve quiz sonuçları da silinecektir."
        onConfirm={() => {
          if (confirmId) handleDelete(confirmId)
        }}
        isLoading={deletingId !== null}
      />
    </div>
  )
}
