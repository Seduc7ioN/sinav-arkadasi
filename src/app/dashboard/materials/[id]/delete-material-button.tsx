"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export function DeleteMaterialButton({ materialId }: { materialId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/study/${materialId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Materyal silinirken bir hata oluştu")
      }
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Materyal silinirken bir hata oluştu")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Sil
      </Button>
      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Materyali silmek istediğine emin misin?"
        description="Bu işlem geri alınamaz. Materyale ait tüm sorular ve quiz sonuçları da silinecektir."
        onConfirm={handleDelete}
        isLoading={loading}
      />
    </>
  )
}
