"use client"

import { useState, useEffect } from "react"
import {
  Wrench,
  Cog,
  Gauge,
  Flame,
  Phone,
  MapPin,
  Menu,
  X,
  Hammer,
  Shield,
  Clock,
  ChevronRight,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Send,
} from "lucide-react"
import { RequestForm } from "@/components/cemil-torna/request-form"

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const services = [
  {
    icon: Cog,
    title: "Disk Taşlama",
    description:
      "Fren disklerinizde oluşan aşınma, yiv ve dalgalanmaları CNC hassasiyetinde taşlıyor, fren performansınızı yeniden zirveye taşıyoruz.",
  },
  {
    icon: Gauge,
    title: "Kampana Taşlama",
    description:
      "Kampana yüzeylerindeki deformasyonları gideriyor, tam yuvasallık sağlayarak güvenli ve sessiz frenleme sunuyoruz.",
  },
  {
    icon: Wrench,
    title: "Volant Taşlama",
    description:
      "Volant dişli yüzeyini hassas şekilde taşlayarak debriyaj sisteminizin kusursuz çalışmasını sağlıyor, titreşimi ortadan kaldırıyoruz.",
  },
  {
    icon: Flame,
    title: "Kaynak İşleri",
    description:
      "Tüm kaynak çeşitlerinde uzmanız. Alüminyum jant kaynağı, egzoz kaynağı, şasi kaynağı ve özel imalat işleriniz için yanınızdayız.",
  },
  {
    icon: Hammer,
    title: "Pres İşleri",
    description:
      "Hidrolik pres ile rulman değişimi, burç takma-çıkarma, doğrultma işlemleri ve tüm pres ihtiyaçlarınızda profesyonel çözüm.",
  },
  {
    icon: Shield,
    title: "Volant Baskı Balata",
    description:
      "Volant baskı balata ayar ve revizyonu ile debriyaj sisteminizi orijinal performansına kavuşturuyoruz.",
  },
  {
    icon: Zap,
    title: "Isıtma Bujisi",
    description:
      "Dizel araçlarda ısıtma bujisi kontrolü, arıza tespiti ve değişimi. Soğuk havalarda aracınızın ilk marşta çalışmasını garanti ediyoruz.",
  },
  {
    icon: Flame,
    title: "Argon Kaynağı",
    description:
      "TIG (Argon) kaynağı ile alüminyum, paslanmaz çelik ve hassas parçaların kaynağında üstün kalite. Motor bloğu, şanzıman ve alüminyum jant onarımı.",
  },
]

const processSteps = [
  { step: 1, title: "Keşif & Arıza Tespiti", desc: "Aracınızı getirin veya fotoğrafla bilgi verin, sorunu tespit edelim." },
  { step: 2, title: "Fiyat Teklifi", desc: "Şeffaf fiyat politikasıyla ücretsiz keşif ve yazılı fiyat teklifi." },
  { step: 3, title: "Profesyonel İşçilik", desc: "CNC tezgahlarımızda uzman kadromuzla tamir ve taşlama işlemi." },
  { step: 4, title: "Test & Teslimat", desc: "İşlem sonrası kalite kontrolü yapıyor, aracınızı güvenle teslim ediyoruz." },
]

export default function CemilTornaPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [shopMessage, setShopMessage] = useState("")
  const [activeService, setActiveService] = useState<number | null>(null)

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/cemil-torna/shop-status")
        .then((r) => r.json())
        .then((d) => {
          setIsOpen(d.is_open ?? true)
          setShopMessage(d.message ?? "")
        })
        .catch(() => {})
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-amber-500/30">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="#" className="flex items-center group">
              <img
                src="/cemiltorna-logo.svg"
                alt="Cemil Torna"
                className="h-10 w-auto"
              />
            </a>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Hizmetler", href: "#hizmetler" },
                { label: "Nasıl Çalışır", href: "#nasil-calisir" },
                
                { label: "İletişim", href: "#iletisim" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <a
                href="https://instagram.com/cemiltorna"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="tel:+905355790900"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-semibold text-black hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
              >
                <Phone className="h-4 w-4" />
                +90 535 579 09 00
              </a>
            </div>

            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/[0.06] py-4 space-y-1">
              {[
                { label: "Hizmetler", href: "#hizmetler" },
                { label: "Nasıl Çalışır", href: "#nasil-calisir" },
                
                { label: "İletişim", href: "#iletisim" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04]"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex items-center gap-2 px-3 pt-2">
                <a
                  href="https://instagram.com/cemiltorna"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-amber-400"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="tel:+905355790900"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-black"
                >
                  <Phone className="h-4 w-4" />
                  +90 535 579 09 00
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(245,158,11,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_100%,rgba(245,158,11,0.06),transparent_50%)]" />

        <div className="absolute top-20 right-[-100px] opacity-[0.03] animate-[spin_30s_linear_infinite]">
          <Cog className="h-[600px] w-[600px] text-amber-500" />
        </div>
        <div className="absolute bottom-10 left-[-80px] opacity-[0.02] animate-[spin_20s_linear_infinite_reverse]">
          <Cog className="h-[500px] w-[500px] text-amber-500" />
        </div>

        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-500/3 rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.04] px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? "bg-green-400" : "bg-red-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`} />
              </span>
              <span className="text-xs font-medium text-amber-400/90">
                {isOpen ? "Şu an açık" : `Kapalı${shopMessage ? ` - ${shopMessage}` : ""}`}
              </span>
              <span className="text-zinc-600">·</span>
              <MapPin className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-500">Yüreğir / Adana</span>
            </div>

            <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-white">Aracınız</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500">
                Emin Ellerde
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base sm:text-lg text-zinc-400 leading-relaxed">
              Cemil Kurt Torna ve Akis Tamir Atölyesi. Disk, kampana, volant taşlama ve kaynak
              işlerinizde Adana&apos;nın güvenilir adresi. CNC hassasiyetiyle profesyonel çözümler.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#hizmetler"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-sm font-semibold text-black hover:from-amber-400 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02]"
              >
                Hizmetlerimizi Keşfedin
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="tel:+905355790900"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white hover:border-white/[0.15] hover:bg-white/[0.06] transition-all"
              >
                <Phone className="h-4 w-4" />
                Hemen Ara
              </a>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-500/70" />
                Ücretsiz Keşif
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-500/70" />
                Garantili Hizmet
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-500/70" />
                Aynı Gün Teslimat
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="hizmetler" className="relative py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.04] px-4 py-1.5 text-xs font-medium text-amber-400/90 mb-6">
              <Sparkles className="h-3 w-3" />
              Uzmanlık Alanlarımız
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Profesyonel{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Hizmetlerimiz
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-zinc-400 leading-relaxed">
              Modern CNC ekipmanlarımız ve uzman kadromuzla aracınızın ihtiyaç duyduğu tüm torna, taşlama ve kaynak
              işlemlerini gerçekleştiriyoruz.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveService(index)}
                  onMouseLeave={() => setActiveService(null)}
                  className={`group relative rounded-2xl border p-6 transition-all duration-500 cursor-default ${
                    activeService === index
                      ? "border-amber-500/40 bg-gradient-to-b from-amber-500/[0.06] to-transparent shadow-lg shadow-amber-500/5"
                      : "border-white/[0.06] bg-white/[0.015]"
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-500 ${
                    activeService === index
                      ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/40"
                      : "bg-white/[0.03] border-white/[0.06] group-hover:border-amber-500/20"
                  }`}>
                    <Icon className={`h-5 w-5 transition-colors duration-500 ${activeService === index ? "text-amber-400" : "text-amber-500/70"}`} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{service.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed transition-colors duration-500 ${
                    activeService === index ? "text-zinc-300" : "text-zinc-500"
                  }`}>{service.description}</p>

                  <div className={`mt-4 flex items-center gap-1 text-xs font-medium transition-all duration-500 ${
                    activeService === index ? "text-amber-400 opacity-100 translate-x-0" : "text-amber-500/50 opacity-0 -translate-x-2"
                  }`}>
                    Detaylı Bilgi
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="nasil-calisir" className="relative py-24 sm:py-32 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.04] px-4 py-1.5 text-xs font-medium text-amber-400/90 mb-6">
              <Cog className="h-3 w-3" />
              Çalışma Sürecimiz
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Nasıl{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Çalışırız
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-zinc-400 leading-relaxed">
              Dört adımda aracınızı güvenle teslim ediyoruz. Şeffaf, hızlı ve garantili hizmet anlayışıyla çalışıyoruz.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 text-amber-400 font-bold text-sm">
                      {String(item.step).padStart(2, "0")}
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block text-zinc-700">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.04] px-4 py-1.5 text-xs font-medium text-amber-400/90 mb-6">
                <Shield className="h-3 w-3" />
                Hakkımızda
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Adana&apos;nın{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Güvenilir Torna Atölyesi
                </span>
              </h2>
              <div className="mt-6 space-y-4 text-zinc-400 leading-relaxed">
                <p>
                  Cemil Kurt Torna ve Akis Tamir Atölyesi olarak Adana Yüreğir&apos;de otomotiv sektörüne
                  hizmet veriyoruz. Disk, kampana ve volant taşlama konusunda bölgenin en güvenilir adresiyiz.
                </p>
                <p>
                  Modern CNC taşlama tezgahlarımız ve alanında uzman ekibimizle, aracınızın fren ve debriyaj sistemlerini
                  fabrika standartlarında yeniliyoruz. Alüminyum jant kaynağından pres işlerine kadar geniş bir
                  yelpazede çözüm sunuyoruz.
                </p>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  "CNC hassasiyetinde disk, kampana ve volant taşlama",
                  "Alüminyum ve paslanmaz çelikte argon (TIG) kaynağı",
                  "Hidrolik pres ile rulman ve burç değişimi",
                  "Tüm işlemlerde garanti ve aynı gün teslimat",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-500/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/[0.06] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_70%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/cemiltorna-logo.svg"
                    alt="Cemil Torna"
                    className="w-64 h-auto"
                  />
                </div>
                <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-amber-500/10 rounded-tl-2xl" />
                <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-amber-500/10 rounded-br-2xl" />
              </div>

              <div className="absolute -bottom-5 -left-5 bg-zinc-900 border border-white/[0.08] rounded-2xl px-5 py-3 shadow-xl backdrop-blur-sm flex items-center gap-4">
                <div className={`flex h-2.5 w-2.5 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <div>
                  <span className="text-sm font-medium text-white block">
                    {isOpen ? "Açık" : "Kapalı"}
                  </span>
                  <span className="text-xs text-zinc-500">Pzt-Cmt 08:00-19:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section id="teklif" className="relative py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.04] px-4 py-1.5 text-xs font-medium text-amber-400/90 mb-6">
                <Send className="h-3 w-3" />
                Fiyat Teklifi Al
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Hemen{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Teklif Alın
                </span>
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                İhtiyacınız olan hizmeti seçin, araç bilgilerinizi girin. Size en kısa sürede fiyat teklifi ile dönüş yapalım.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-6 sm:p-8">
              <RequestForm />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="iletisim" className="relative py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.04] px-4 py-1.5 text-xs font-medium text-amber-400/90 mb-6">
              <Phone className="h-3 w-3" />
              İletişim
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Bize{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Ulaşın
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-zinc-400 leading-relaxed">
              Adana Yüreğir&apos;deki atölyemize bekleriz. Ücretsiz keşif ve fiyat teklifi için hemen arayın.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-8">
              <h3 className="text-xl font-bold text-white mb-8">İletişim Bilgileri</h3>
              <div className="space-y-6">
                <a
                  href="tel:+905355790900"
                  className="flex items-start gap-4 group rounded-xl p-3 -mx-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all">
                    <Phone className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Telefon</div>
                    <div className="text-sm text-zinc-400 group-hover:text-amber-400 transition-colors">
                      +90 535 579 09 00
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <MapPin className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Adres</div>
                    <div className="text-sm text-zinc-400">
                      Levent Mah., 1827. Sok., No:72A<br />
                      Yüreğir / Adana
                    </div>
                    <div className="text-xs text-amber-500/70 mt-1">Polis Okulu Kavşağı mevkiinde</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Çalışma Saatleri</div>
                    <div className="text-sm text-zinc-400">Pazartesi - Cumartesi: 08:00 - 19:00</div>
                    <div className="text-xs text-zinc-600 mt-0.5">Pazar günleri kapalıyız</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+905355790900"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-semibold text-black hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Phone className="h-4 w-4" />
                  Hemen Ara
                </a>
                <a
                  href="https://instagram.com/cemiltorna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-3.5 text-sm font-semibold text-white hover:border-white/[0.15] hover:bg-white/[0.06] transition-all"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-8">Konum</h3>
              <div className="flex-1 rounded-xl border border-white/[0.06] bg-zinc-950 overflow-hidden relative min-h-[250px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3185.8!2d35.327!3d36.990!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDU5JzI0LjAiTiAzNcKwMTknMzcuMiJF!5e0!3m2!1str!2str!4v1690000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title="Cemil Torna Konum"
                />
              </div>
              <p className="mt-4 text-xs text-zinc-500 text-center">
                Levent Mah., 1827. Sok., No:72A, Yüreğir/Adana
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <img
                src="/cemiltorna-logo.svg"
                alt="Cemil Torna"
                className="h-8 w-auto"
              />
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/cemiltorna"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="tel:+905355790900"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                aria-label="Telefon"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} Cemil Kurt. Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-zinc-700">
              <a
                href="https://instagram.com/cemiltorna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500/70 hover:text-amber-400 transition-colors"
              >
                @cemiltorna
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/905355790900?text=${encodeURIComponent("Merhaba, fiyat teklifi almak istiyorum.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-500/25 hover:bg-[#20bd5a] hover:scale-110 transition-all"
        aria-label="WhatsApp ile iletişime geç"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}
