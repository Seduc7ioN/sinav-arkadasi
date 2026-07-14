import { FileText, ImageIcon, Presentation, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import type { StudyMaterial } from "@/types"

export function getFileIcon(type: string) {
  if (type === "pdf") return <FileText className="h-5 w-5" />
  if (type === "ppt") return <Presentation className="h-5 w-5" />
  return <ImageIcon className="h-5 w-5" />
}

export function getFileIconSmall(type: string) {
  if (type === "pdf") return <FileText className="h-4 w-4" />
  if (type === "ppt") return <Presentation className="h-4 w-4" />
  return <ImageIcon className="h-4 w-4" />
}

export function StatusBadge({ status, errorMessage }: { status: StudyMaterial["status"]; errorMessage: string | null }) {
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
