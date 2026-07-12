import Link from "next/link"
import { redirect } from "next/navigation"
import { Sparkles, BookOpen, Upload, FileQuestion } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "./logout-button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
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
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Panel</h1>
          <p className="text-muted-foreground mb-8">
            Mobil uygulamayı indirerek notlarını yükleyebilir ve sorular oluşturabilirsin.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Not Yükle</h3>
              <p className="text-sm text-muted-foreground">
                Fotoğraf, PDF veya slaytını mobil uygulamadan yükle.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileQuestion className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Soru Oluştur</h3>
              <p className="text-sm text-muted-foreground">
                Yapay zekâ ile konudan otomatik test soruları üret.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Çalış</h3>
              <p className="text-sm text-muted-foreground">
                Ürettiğin sorularla konuy pekiştir.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-xl border bg-muted/30 p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Uygulamayı İndir</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Web üzerinden şu an sadece giriş yapabilirsin. Not yükleme ve soru oluşturma
              işlemleri için mobil uygulamayı kullan.
            </p>
            <Link href="/">
              <Button variant="outline">Ana Sayfaya Dön</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
