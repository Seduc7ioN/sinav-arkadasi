"use client"

import { useState } from "react"
import { LegalLayout } from "@/components/shared/legal-layout"
import { COMPANY_EMAIL } from "@/lib/kvkk"
import { Send, CheckCircle2 } from "lucide-react"

const requestTypes = [
  "Verilerime erişim talebi",
  "Verilerimin düzeltilmesi talebi",
  "Verilerimin silinmesi talebi",
  "Veri işlemeye itiraz",
  "Diğer",
]

export default function VeriSahibiPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <LegalLayout title="Veri Sahibi Başvuru Formu">
      <p className="text-muted-foreground mb-8">
        6698 sayılı KVKK kapsamında haklarınızı kullanmak için aşağıdaki formu doldurabilir
        veya doğrudan{" "}
        <a href={`mailto:${COMPANY_EMAIL}`} className="text-primary hover:underline">
          {COMPANY_EMAIL}
        </a>{" "}
        adresine yazabilirsiniz.
      </p>

      {submitted ? (
        <div className="rounded-xl border p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Başvurunuz Alındı</h2>
          <p className="text-muted-foreground">
            Talebiniz en kısa sürede değerlendirilerek e-posta adresinize yanıtlanacaktır.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Adınız ve soyadınız"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Talep Türü
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Seçiniz</option>
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Açıklama
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Talebinizi detaylı bir şekilde açıklayınız..."
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="h-4 w-4" />
            Başvuruyu Gönder
          </button>
        </form>
      )}
    </LegalLayout>
  )
}
