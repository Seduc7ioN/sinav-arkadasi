# Materyal Silme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kullanıcıların yükledikleri materyalleri (notları) hem liste hem detay görünümünden onay alarak kalıcı olarak silebilmesini sağlamak.

**Architecture:** Mevcut `GET /api/study/[id]` route handler'ına `DELETE` metodu eklenir. Önce auth ve sahiplik doğrulanır, ardından Supabase Storage'dan dosya ve `study_materials` tablosundan kayıt silinir. UI'da shadcn/ui AlertDialog ile onay akışı oluşturulur; liste ve detay sayfalarına "Sil" butonu eklenir.

**Tech Stack:** Next.js App Router, React Server/Client Components, TypeScript, Supabase (auth + DB + Storage), shadcn/ui (Button, AlertDialog), Tailwind CSS.

## Global Constraints
- Tüm API route'ları `src/lib/supabase/request-auth.ts`'teki `getUserFromRequest` ile auth kontrolü yapmalı.
- Kullanıcı sadece kendi materyalleri üzerinde işlem yapmalı.
- Build (`npm run build`) her task sonrası başarılı olmalı.
- Yeni UI bileşenleri mevcut shadcn/ui ve Tailwind kalıplarını takip etmeli.

---

### Task 1: DELETE API Endpoint

**Files:**
- Modify: `src/app/api/study/[id]/route.ts`

**Interfaces:**
- Consumes: `getUserFromRequest(request)`, `createServiceClient()`
- Produces: `DELETE(request: Request, { params }: { params: Promise<{ id: string }> })` handler

- [ ] **Step 1: Import `NextResponse` hariç gerekli modülleri doğrula**

Mevcut import'lar şunlar olmalı:

```typescript
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service-client"
import { getUserFromRequest } from "@/lib/supabase/request-auth"
import { corsResponse, handleCorsPreflight } from "../cors"
```

- [ ] **Step 2: `DELETE` handler'ını ekle**

`GET` handler'ının altına şunu ekle:

```typescript
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
        const filePath = bucketIndex >= 0 ? pathParts.slice(bucketIndex + 1).join("/") : ""
        if (filePath) {
          await supabase.storage.from("study-materials").remove([decodeURIComponent(filePath)])
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
```

- [ ] **Step 3: Build kontrolü**

Run: `npm run build`
Expected: SUCCESS, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/study/[id]/route.ts
git commit -m "feat(api): add DELETE endpoint for study materials"
```

---

### Task 2: Reusable Delete Confirmation Dialog

**Files:**
- Create: `src/components/delete-confirmation-dialog.tsx`

**Interfaces:**
- Consumes: shadcn/ui `AlertDialog`, `Button`
- Produces: `DeleteConfirmationDialog` React component

- [ ] **Step 1: Yeni bileşeni oluştur**

```tsx
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title = "Silmek istediğine emin misin?",
  description = "Bu işlem geri alınamaz.",
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sil
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 2: `alert-dialog` bileşeninin varlığını kontrol et**

Eğer `src/components/ui/alert-dialog.tsx` yoksa shadcn/ui ile ekle:

```bash
npx shadcn add alert-dialog
```

- [ ] **Step 3: Build kontrolü**

Run: `npm run build`
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/components/delete-confirmation-dialog.tsx src/components/ui/alert-dialog.tsx
git commit -m "feat(ui): add reusable delete confirmation dialog"
```

---

### Task 3: Delete Button in Materials List

**Files:**
- Modify: `src/app/dashboard/materials-list.tsx`

**Interfaces:**
- Consumes: `DeleteConfirmationDialog`, `useRouter()`
- Produces: List item with delete button

- [ ] **Step 1: Import ekle**

Mevcut import'ların yanına ekle:

```typescript
import { useState } from "react"
import { FileText, ImageIcon, Presentation, Loader2, Sparkles, AlertCircle, CheckCircle2, Play, Trash2 } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
```

- [ ] **Step 2: State ve handler ekle**

`MaterialsList` fonksiyonunun içine ekle:

```typescript
const [deletingId, setDeletingId] = useState<string | null>(null)
const [confirmId, setConfirmId] = useState<string | null>(null)

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
```

- [ ] **Step 3: Butonu kartlara ekle**

Mevcut buton grubunun sonuna ekle (her materyal için):

```tsx
<button
  onClick={() => setConfirmId(material.id)}
  disabled={deletingId === material.id || analyzingId === material.id}
  className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
>
  {deletingId === material.id ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Trash2 className="h-4 w-4" />
  )}
  Sil
</button>
```

Ve component return'ünün en altına (map dışında) AlertDialog render et:

```tsx
<DeleteConfirmationDialog
  open={confirmId !== null}
  onOpenChange={(open) => !open && setConfirmId(null)}
  title="Materyali silmek istediğine emin misin?"
  description="Bu işlem geri alınamaz. Materyale ait tüm sorular ve quiz sonuçları da silinecektir."
  onConfirm={() => confirmId && handleDelete(confirmId)}
  isLoading={deletingId !== null}
/>
```

- [ ] **Step 4: Build kontrolü**

Run: `npm run build`
Expected: SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/materials-list.tsx
git commit -m "feat(dashboard): add delete button to materials list"
```

---

### Task 4: Delete Button in Material Detail Page

**Files:**
- Modify: `src/app/dashboard/materials/[id]/page.tsx`

**Interfaces:**
- Consumes: `DeleteConfirmationDialog`, `redirect`
- Produces: Server page with client delete button

- [ ] **Step 1: Client delete wrapper oluştur**

Aynı dosyanın en altına ekle:

```tsx
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
```

- [ ] **Step 2: Detay sayfasında butonu göster**

`page.tsx`'te mevcut `Button` importunun yanına `Trash2` ekle ve başlık satırının yanına buton grubu ekle:

```tsx
import { ArrowLeft, FileText, ImageIcon, Presentation, Trash2 } from "lucide-react"
```

Ve şu bölümü:

```tsx
{material.status === "completed" && questionList.length > 0 && (
  <Link href={`/dashboard/quiz/${material.id}`}>
    <Button>Quiz Başlat</Button>
  </Link>
)}
```

Şununla değiştir:

```tsx
<div className="flex items-center gap-2 ml-auto">
  {material.status === "completed" && questionList.length > 0 && (
    <Link href={`/dashboard/quiz/${material.id}`}>
      <Button>Quiz Başlat</Button>
    </Link>
  )}
  <DeleteMaterialButton materialId={material.id} />
</div>
```

Ayrıca `Button` importunu kaldırma; hâlâ Quiz Başlat butonunda kullanılıyor.

- [ ] **Step 3: Build kontrolü**

Run: `npm run build`
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/materials/[id]/page.tsx
git commit -m "feat(material): add delete button to material detail page"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - API delete endpoint → Task 1
   - Onay dialogu → Task 2
   - Liste sil butonu → Task 3
   - Detay sil butonu → Task 4
   - Storage ve DB silme → Task 1
   - Kullanıcı yetkilendirme → Task 1

2. **Placeholder scan:**
   - Hiç "TBD", "TODO", "implement later" yok.
   - Tüm kod blokları tam.

3. **Type consistency:**
   - `DeleteConfirmationDialog` props tutarlı.
   - `handleDelete` imzaları tutarlı.
