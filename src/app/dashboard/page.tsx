import Link from "next/link"
import { redirect } from "next/navigation"
import { Sparkles, BookOpen, Upload, FileQuestion } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "./logout-button"
import { UploadDialog } from "./upload-dialog"
import { MaterialsList } from "./materials-list"
import type { StudyMaterial } from "@/types"

async function getMaterials(): Promise<StudyMaterial[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: materials, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !materials) return []

  const materialIds = materials.map((m) => m.id)
  const { data: questionCounts } = await supabase
    .from("questions")
    .select("material_id")
    .in("material_id", materialIds)

  const countMap = new Map<string, number>()
  questionCounts?.forEach((q) => {
    countMap.set(q.material_id, (countMap.get(q.material_id) || 0) + 1)
  })

  return materials.map((m) => ({
    ...m,
    question_count: countMap.get(m.id) || 0,
  }))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const materials = await getMaterials()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span>Sınav Arkadaşı</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Panel</h1>
              <p className="text-muted-foreground">
                Notlarını yükle, sorular oluştur ve çalış.
              </p>
            </div>
            <UploadDialog />
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Link href="#materials" className="rounded-xl border p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Not Yükle</h3>
              <p className="text-sm text-muted-foreground">
                Fotoğraf, PDF veya slaytını webden hızlıca yükle.
              </p>
            </Link>

            <Link href="#materials" className="rounded-xl border p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileQuestion className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Soru Oluştur</h3>
              <p className="text-sm text-muted-foreground">
                Yapay zekâ ile konudan otomatik test soruları üret.
              </p>
            </Link>

            <Link href="#materials" className="rounded-xl border p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Çalış</h3>
              <p className="text-sm text-muted-foreground">
                Ürettiğin sorularla konuyu pekiştir.
              </p>
            </Link>
          </div>

          <section id="materials">
            <h2 className="text-xl font-semibold mb-4">Materyallerim</h2>
            <MaterialsList materials={materials} />
          </section>
        </div>
      </main>
    </div>
  )
}
