"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, X, FileText, ImageIcon, Presentation } from "lucide-react"

const VALID_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
]

const MAX_SIZE = 20 * 1024 * 1024

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FileText className="h-5 w-5" />
  if (type.includes("presentation") || type.includes("powerpoint") || type.includes("ppt"))
    return <Presentation className="h-5 w-5" />
  return <ImageIcon className="h-5 w-5" />
}

export function UploadDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const fileExt = selected.name.split(".").pop()?.toLowerCase() || ""
    const isValidType =
      VALID_TYPES.includes(selected.type) ||
      ["pdf", "ppt", "pptx", "jpg", "jpeg", "png", "webp"].includes(fileExt)

    if (!isValidType) {
      setError("Desteklenmeyen dosya formatı. Lütfen JPEG, PNG, PDF veya PPT yükleyin.")
      setFile(null)
      return
    }

    if (selected.size > MAX_SIZE) {
      setError("Dosya boyutu 20MB'dan büyük olamaz.")
      setFile(null)
      return
    }

    setError(null)
    setFile(selected)
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setError("Lütfen bir dosya seç.")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""))

    try {
      const res = await fetch("/api/study/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Yükleme başarısız")
      }

      setOpen(false)
      setFile(null)
      setTitle("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme sırasında bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Not Yükle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Yeni Not Yükle</h2>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-md p-1 hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium">
                  Başlık
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Örn. Tarih Ders Notları"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Dosya</label>
                <div
                  onClick={() => inputRef.current?.click()}
                  className="cursor-pointer rounded-lg border border-dashed border-input bg-muted/30 p-6 text-center hover:bg-muted/50 transition-colors"
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {getFileIcon(file.type)}
                      <span className="font-medium">{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Dosya seçmek için tıkla</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, PDF veya PPT · max 20MB
                      </p>
                    </>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Yükle
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
