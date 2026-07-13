import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { QuizPlayer } from "./quiz-player"

export default async function QuizPage({
  params,
}: {
  params: Promise<{ materialId: string }>
}) {
  const { materialId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: material } = await supabase
    .from("study_materials")
    .select("title")
    .eq("id", materialId)
    .eq("user_id", user.id)
    .single()

  if (!material) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Panele Dön
          </Link>
          <span className="font-medium">{material.title}</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <QuizPlayer materialId={materialId} />
      </main>
    </div>
  )
}
