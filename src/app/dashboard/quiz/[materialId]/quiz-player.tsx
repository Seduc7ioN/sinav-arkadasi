"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Question, QuizSession } from "@/types"

interface QuizPlayerProps {
  materialId: string
}

interface SavedAnswer {
  selectedOption: number
  isCorrect: boolean
}

export function QuizPlayer({ materialId }: QuizPlayerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [savedAnswers, setSavedAnswers] = useState<Record<string, SavedAnswer>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/study/quiz/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
      signal: controller.signal,
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
        if (err.name === "AbortError") return
        setError(err instanceof Error ? err.message : "Quiz başlatılamadı")
        setLoading(false)
      })
    return () => controller.abort()
  }, [materialId])

  const currentQuestion = questions[currentIndex]
  const savedAnswer = currentQuestion ? savedAnswers[currentQuestion.id] : undefined

  const handleSelectOption = (optionIndex: number) => {
    if (submitting || savedAnswer) return
    setSelectedOption(optionIndex)
  }

  const handleSaveAnswer = async () => {
    if (submitting || selectedOption === null || !session || !currentQuestion) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/study/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: currentQuestion.id,
          selectedOption,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSavedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedOption,
          isCorrect: data.answer?.is_correct ?? false,
        },
      }))
      setShowFeedback(true)
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
      setShowFeedback(false)
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

  const isLast = currentIndex === questions.length - 1
  const progressPercent = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Soru {currentIndex + 1} / {questions.length}
        </span>
        <div
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Soru ${currentIndex + 1} / ${questions.length}`}
          className="h-2 w-32 rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">{currentQuestion.question_text}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx
            const isSaved = savedAnswer?.selectedOption === idx
            const isCorrect = currentQuestion.correct_option === idx
            const showCorrect = showFeedback && isCorrect
            const showWrong = showFeedback && isSaved && !isCorrect

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={submitting || !!savedAnswer}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  showCorrect
                    ? "border-green-200 bg-green-50 text-green-900"
                    : showWrong
                    ? "border-red-200 bg-red-50 text-red-900"
                    : isSelected
                    ? "border-primary bg-primary/10 font-medium"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + idx)})</span>{" "}
                {option}
                {showCorrect && (
                  <span className="ml-2 text-xs font-medium">Doğru cevap</span>
                )}
                {showWrong && (
                  <span className="ml-2 text-xs font-medium">Senin cevabın</span>
                )}
              </button>
            )
          })}
        </div>

        {showFeedback && currentQuestion.explanation && (
          <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Açıklama:</span>{" "}
            {currentQuestion.explanation}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {!savedAnswer ? (
          <Button onClick={handleSaveAnswer} disabled={submitting || selectedOption === null}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Cevabı Kaydet
          </Button>
        ) : isLast ? (
          <Button onClick={handleFinish} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Bitir
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Sonraki
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
