"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient, setRememberMe } from "@/lib/supabase/client"
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react"

function getAuthErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı."
  }
  if (lower.includes("email not confirmed")) {
    return "E-posta adresin doğrulanmamış. Lütfen gelen kutunu kontrol et."
  }
  if (lower.includes("user not found")) {
    return "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı."
  }
  return message
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMeState] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMeState(checked)
    setRememberMe(checked)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(getAuthErrorMessage(error.message))
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Hoş Geldin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesabına giriş yaparak devam et
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
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => handleRememberMeChange(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Beni hatırla
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Şifremi unuttum
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Giriş Yap
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Ücretsiz kaydol
        </Link>
      </p>
    </div>
  )
}
