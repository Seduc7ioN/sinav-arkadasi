import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("*, material:study_materials(title)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single()

  if (!session) {
    redirect("/dashboard")
  }

  const { data: answers } = await supabase
    .from("quiz_answers")
    .select("*, question:questions(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  const answerList = answers || []
  const correctCount = answerList.filter((a) => a.is_correct).length
  const total = answerList.length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0

  const materialTitle = (session.material as { title: string } | null)?.title || "Materyal"
  const CIRCUMFERENCE = 2 * Math.PI * 45

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Panele Dön
          </Link>
          <span className="font-medium">Sonuçlar</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 rounded-xl border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold mb-2">{materialTitle}</h1>
            <p className="text-muted-foreground mb-6">Quiz Tamamlandı</p>

            <div className="inline-flex items-center justify-center">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${(percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{correctCount} Doğru</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>{total - correctCount} Yanlış</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/dashboard/quiz/${session.material_id}`}>
                <Button>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Panele Dön</Button>
              </Link>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Soru İnceleme</h2>
          <div className="space-y-4">
            {answerList.map((answer, idx) => {
              const question = answer.question
              if (!question) return null
              return (
                <div key={answer.id} className="rounded-xl border p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {idx + 1}
                    </span>
                    <h3 className="font-medium">{question.question_text}</h3>
                  </div>

                  <ul className="space-y-2 mb-3">
                    {(Array.isArray(question.options) ? question.options : []).map((option: string, optIdx: number) => {
                      const isCorrect = optIdx === question.correct_option
                      const isSelected = optIdx === answer.selected_option
                      return (
                        <li
                          key={optIdx}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isCorrect
                              ? "border-green-200 bg-green-50 text-green-900"
                              : isSelected
                              ? "border-red-200 bg-red-50 text-red-900"
                              : "bg-muted/30"
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optIdx)})</span>{" "}
                          {option}
                          {isCorrect && <span className="ml-2 text-xs font-medium">Doğru</span>}
                          {isSelected && !isCorrect && <span className="ml-2 text-xs font-medium">Senin cevabın</span>}
                        </li>
                      )
                    })}
                  </ul>

                  {question.explanation && (
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Açıklama:</span>{" "}
                      {question.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
