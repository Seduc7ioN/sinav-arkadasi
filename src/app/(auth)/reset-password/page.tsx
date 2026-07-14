"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function getAuthErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("weak password")) {
    return "Şifre çok zayıf. En az 6 karakter kullan."
  }
  if (lower.includes("token")) {
    return "Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeniden iste."
  }
  return message
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [exchanging, setExchanging] = useState(true)

  useEffect(() => {
    if (!code) {
      setExchanging(false)
      setError("Sıfırlama bağlantısında geçersiz kod. Lütfen yeni bir link iste.")
      return
    }

    const supabase = createClient()
    supabase.auth
      .exchangeCodeForSession(code)
      .then((result: { error?: { message: string } }) => {
        if (result.error) {
          setError(getAuthErrorMessage(result.error.message))
        }
      })
      .catch(() => {
        setError("Oturum açılırken bir hata oluştu. Lütfen tekrar dene.")
      })
      .finally(() => {
        setExchanging(false)
      })
  }, [code])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(getAuthErrorMessage(error.message))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  if (exchanging) {
    return (
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Oturum açılıyor…</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Şifren Güncellendi</h1>
        <p className="text-muted-foreground mb-6">
          Yeni şifrenle giriş yapabilirsin. Giriş sayfasına yönlendiriliyorsun.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Yeni Şifre Belirle</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesabın için yeni bir şifre oluştur.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Yeni Şifre
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
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">En az 6 karakter</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Şifreyi Sıfırla
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Hatırladın mı?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Yükleniyor…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
