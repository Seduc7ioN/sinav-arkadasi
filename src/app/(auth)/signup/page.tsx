"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react"

function getAuthErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("user already registered")) {
    return "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dene."
  }
  if (lower.includes("password")) {
    return "Şifre gereksinimleri karşılanmıyor. En az 6 karakter kullan."
  }
  return message
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth
      .getSession()
      .then((result: { data: { session: { access_token: string } | null } }) => {
        if (result.data.session) {
          router.replace("/dashboard")
        }
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(getAuthErrorMessage(error.message))
      setLoading(false)
      return
    }

    // Eğer e-posta doğrulaması kapalıysa oturum açılır, direkt panele yönlendir.
    if (data.session) {
      router.push("/dashboard")
      router.refresh()
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Kaydın Alındı</h1>
        <p className="text-muted-foreground mb-6">
          E-posta adresine bir doğrulama linki gönderdik. Lütfen gelen kutunu kontrol et.
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
        <h1 className="text-2xl font-bold">Ücretsiz Kaydol</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sınav Arkadaşı ile yapay zekâ destekli çalışmaya başla
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

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Şifre
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">En az 6 karakter</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Hesap Oluştur
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}
