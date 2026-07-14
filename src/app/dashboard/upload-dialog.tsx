"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, FileText, ImageIcon, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getFileIcon } from "@/components/material-helpers"

const VALID_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
]

const MAX_SIZE = 20 * 1024 * 1024

interface UploadDialogProps {
  children?: React.ReactNode
}

export function UploadDialog({ children }: UploadDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selected: File | null) => {
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

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Not Yükle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Not Yükle</DialogTitle>
          <DialogDescription>
            Ders notu, slayt veya fotoğraf yükle; yapay zeka sana özel sorular oluştursun.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
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
            <span className="mb-2 block text-sm font-medium">Dosya</span>
            <label
              htmlFor="file"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  inputRef.current?.click()
                }
              }}
              className="block cursor-pointer rounded-lg border border-dashed border-input bg-muted/30 p-6 text-center hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  {file.type.includes("pdf") || file.type.includes("presentation") || file.type.includes("powerpoint") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx") || file.name.endsWith(".pdf") ? (
                    file.type.includes("pdf") || file.name.endsWith(".pdf") ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Presentation className="h-5 w-5" />
                    )
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Dosya seç veya sürükle-bırak</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, PDF veya PPT · max 20MB
                  </p>
                </>
              )}
              <input
                id="file"
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.ppt,.pptx"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="upload-form" disabled={loading || !file} className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Yükle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
