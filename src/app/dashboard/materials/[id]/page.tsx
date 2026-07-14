import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { getFileIcon } from "@/components/material-helpers"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import type { Question } from "@/types"
import { DeleteMaterialButton } from "./delete-material-button"

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: material } = await supabase
    .from("study_materials")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!material) {
    redirect("/dashboard")
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("material_id", id)
    .order("created_at", { ascending: true })

  const questionList: Question[] = questions || []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <ArrowLeft className="h-5 w-5" />
            <span>Panele Dön</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {getFileIcon(material.file_type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{material.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {questionList.length} soru ·{" "}
                {new Date(material.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {material.status === "completed" && questionList.length > 0 && (
                <Link href={`/dashboard/quiz/${material.id}`}>
                  <Button>Quiz Başlat</Button>
                </Link>
              )}
              <DeleteMaterialButton materialId={material.id} />
            </div>
          </div>

          {material.status !== "completed" && (
            <div className="mb-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Bu materyal için henüz soru oluşturulmamış. Dashboard'dan "Soru Oluştur" butonuna tıkla.
            </div>
          )}

          <div className="mb-8 rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Yüklenen Dosya</h2>
            {material.file_type === "image" ? (
              <img
                src={material.storage_path}
                alt={material.title}
                className="max-h-96 w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {material.file_type === "pdf" ? "PDF dosyası önizlemesi" : "PPT dosyası önizlemesi"} için aşağıdaki bağlantıya tıkla.
                </p>
                <Button asChild variant="outline" className="w-fit">
                  <a href={material.storage_path} target="_blank" rel="noopener noreferrer">
                    Dosyayı Görüntüle
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questionList.map((question, index) => (
              <div key={question.id} className="rounded-xl border p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <h3 className="font-medium">{question.question_text}</h3>
                </div>

                <ul className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <li
                      key={optionIndex}
                      className={`rounded-lg border px-4 py-2 text-sm ${
                        optionIndex === question.correct_option
                          ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-900/20 dark:text-green-100"
                          : "bg-muted/30"
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + optionIndex)})</span>{" "}
                      {option}
                      {optionIndex === question.correct_option && (
                        <span className="ml-2 text-xs font-medium text-green-700 dark:text-green-400">
                          Doğru cevap
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {question.explanation && (
                  <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Açıklama:</span>{" "}
                    {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
