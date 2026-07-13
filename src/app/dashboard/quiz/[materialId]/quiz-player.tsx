"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import type { Question, QuizSession } from "@/types"

interface QuizPlayerProps {
  materialId: string
}

export function QuizPlayer({ materialId }: QuizPlayerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/study/quiz/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
    })
      .then((res) => res.text())
      .then((text) => {
        const data = JSON.parse(text)
        if (data.error) throw new Error(data.error)
        setSession(data.session)
        setQuestions(data.questions)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Quiz başlatılamadı")
        setLoading(false)
      })
  }, [materialId])

  const handleAnswer = async (optionIndex: number) => {
    if (submitting || !session) return
    setSubmitting(true)
    setSelectedOption(optionIndex)

    const currentQuestion = questions[currentIndex]

    try {
      const res = await fetch("/api/study/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: currentQuestion.id,
          selectedOption: optionIndex,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cevap kaydedilemedi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
    }
  }

  const handleFinish = async () => {
    if (!session) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/study/quiz/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      router.push(`/dashboard/quiz/session/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quiz bitirilemedi")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="rounded-lg bg-muted p-8 text-center text-sm text-muted-foreground">
        Bu materyal için henüz soru yok.
      </div>
    )
  }

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Soru {currentIndex + 1} / {questions.length}
        </span>
        <div className="h-2 w-32 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">{question.question_text}</h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={submitting}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                selectedOption === idx
                  ? "border-primary bg-primary/10 font-medium"
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + idx)})</span>{" "}
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        {isLast ? (
          <button
            onClick={handleFinish}
            disabled={submitting || selectedOption === null}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Bitir
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Sonraki
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
