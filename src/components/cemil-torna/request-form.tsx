"use client"

import { useState } from "react"
import { Send, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const serviceOptions = [
  "Disk Taşlama",
  "Kampana Taşlama",
  "Volant Taşlama",
  "Kaynak İşleri",
  "Pres İşleri",
  "Volant Baskı Balata",
  "Isıtma Bujisi",
  "Argon Kaynağı",
]

export function RequestForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    service_type: "",
    customer_name: "",
    customer_phone: "",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_year: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.service_type || !form.customer_name || !form.customer_phone) {
      toast.error("Lütfen zorunlu alanları doldurun.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/cemil-torna/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      toast.success("Talebiniz alındı! En kısa sürede dönüş yapacağız.")
    } catch {
      toast.error("Bir hata oluştu. Lütfen telefonla ulaşın.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Talebiniz Alındı!</h3>
        <p className="text-zinc-400 text-sm">
          En kısa sürede sizinle iletişime geçeceğiz. Acil durumlarda{" "}
          <a href="tel:+905355790900" className="text-amber-400 hover:underline">
            +90 535 579 09 00
          </a>{" "}
          numarasından ulaşabilirsiniz.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Hizmet Türü <span className="text-amber-500">*</span>
          </label>
          <select
            name="service_type"
            value={form.service_type}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled className="bg-zinc-900 text-zinc-500">
              Hizmet seçiniz
            </option>
            {serviceOptions.map((s) => (
              <option key={s} value={s} className="bg-zinc-900 text-white">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Ad Soyad <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            required
            placeholder="Adınız Soyadınız"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Telefon <span className="text-amber-500">*</span>
          </label>
          <input
            type="tel"
            name="customer_phone"
            value={form.customer_phone}
            onChange={handleChange}
            required
            placeholder="05XX XXX XX XX"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Araç Markası</label>
          <input
            type="text"
            name="vehicle_brand"
            value={form.vehicle_brand}
            onChange={handleChange}
            placeholder="örn. Renault"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Araç Modeli</label>
          <input
            type="text"
            name="vehicle_model"
            value={form.vehicle_model}
            onChange={handleChange}
            placeholder="örn. Megane"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Araç Yılı</label>
          <input
            type="text"
            name="vehicle_year"
            value={form.vehicle_year}
            onChange={handleChange}
            placeholder="örn. 2020"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Ek Notlar</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Varsa eklemek istediğiniz bilgiler..."
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-semibold text-black hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Teklif Talebi Gönder
          </>
        )}
      </button>
    </form>
  )
}
