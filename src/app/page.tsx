import Link from "next/link"
import { Sparkles, Camera, FileText, BookOpen, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span>Sınav Arkadaşı</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Giriş Yap</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 lg:px-8 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Notunu Çek.
              <br />
              <span className="text-primary">Sorular Hazır.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Yapay zekâ destekli çalışma asistanın. Ders notlarını, kitap sayfalarını veya slaytlarını
              fotoğrafla; sana özel çoktan seçmeli sorular anında oluştursun.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="text-base h-12 px-8">
                  Ücretsiz Başla
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base h-12 px-8">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="ozellikler" className="border-t py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group rounded-xl border p-6 transition-colors hover:bg-accent"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t py-20 lg:py-28 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Hemen Başla</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Sınav Arkadaşı mobil uygulamasını indir, notunu çek ve yapay zekânın sorularını gör.
              Web üzerinden de kullanabilirsin.
            </p>
            <a href="mailto:destek@sinavarkadasi.app">
              <Button size="lg" className="text-base h-12 px-8">
                Bilgi Al
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 font-semibold text-sm mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Sınav Arkadaşı</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Notunu çek, sorular hazır.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Özellikler</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Fotoğraftan Soru Çıkarma</li>
                <li>PDF ve Slayt Analizi</li>
                <li>Çoktan Seçmeli Testler</li>
                <li>Mobil ve Web</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/kvkk" className="text-muted-foreground hover:text-foreground transition-colors">
                    KVKK Aydınlatma Metni
                  </Link>
                </li>
                <li>
                  <Link href="/kvkk/cerez-politikasi" className="text-muted-foreground hover:text-foreground transition-colors">
                    Çerez Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/kvkk/veri-sahibi" className="text-muted-foreground hover:text-foreground transition-colors">
                    Veri Sahibi Başvuru Formu
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} Sınav Arkadaşı. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Fotoğraf Çek",
    description:
      "Telefonunla ders notunu veya kitap sayfasını çek. Yapay zekâ metni okusun.",
    icon: Camera,
  },
  {
    title: "PDF ve Slayt",
    description:
      "PDF, PPT ve DOCX dosyalarını yükle. İçerik otomatik analiz edilsin.",
    icon: FileText,
  },
  {
    title: "Test Oluştur",
    description:
      "Konudan otomatik çoktan seçmeli sorular ve açıklamalı cevaplar üretsin.",
    icon: BookOpen,
  },
  {
    title: "Her Yerde Çalışır",
    description:
      "iOS, Android ve web'de çalışan tek uygulama. İster telefonda ister bilgisayarda.",
    icon: Smartphone,
  },
  {
    title: "Akıllı Analiz",
    description:
      "NVIDIA NIM yapay zekâ ile notundaki kavramları tanır, önemli noktalardan soru üretir.",
    icon: Sparkles,
  },
  {
    title: "Tüm Dersler",
    description:
      "Matematikten tarihe, fen bilimlerinden dile kadar her konuda yardımcı olur.",
    icon: BookOpen,
  },
]
