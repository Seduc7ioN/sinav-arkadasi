"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Loader2, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function getAuthErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("user not found")) {
    return "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı."
  }
  return message
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(getAuthErrorMessage(error.message))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link Gönderildi</h1>
        <p className="text-muted-foreground mb-6">
          {email} adresine şifre sıfırlama linki gönderdik. Lütfen gelen kutunu kontrol et.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Giriş Sayfasına Git
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Şifreni Sıfırla</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          E-posta adresini gir, sana sıfırlama linki gönderelim.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="ornek@email.com"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Sıfırlama Bağlantısı Gönder
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Giriş sayfasına dön
      </Link>
    </div>
  )
}
