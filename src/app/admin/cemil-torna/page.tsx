"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Phone,
  Clock,
  ToggleLeft,
  ToggleRight,
  Loader2,
  LogOut,
  RefreshCw,
  MessageCircle,
  Trash2,
  ChevronLeft,
} from "lucide-react"
import { toast } from "sonner"

type RequestStatus = "pending" | "contacted" | "completed" | "cancelled"

interface ServiceRequest {
  id: string
  service_type: string
  customer_name: string
  customer_phone: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: string
  notes: string
  status: RequestStatus
  created_at: string
}

const statusLabels: Record<RequestStatus, string> = {
  pending: "Bekliyor",
  contacted: "İletişime Geçildi",
  completed: "Tamamlandı",
  cancelled: "İptal",
}

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [message, setMessage] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const res = await fetch("/api/cemil-torna/requests")
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch {}
    setLoadingRequests(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    })

    fetch("/api/cemil-torna/shop-status")
      .then((r) => r.json())
      .then((d) => {
        setIsOpen(d.is_open ?? true)
        setMessage(d.message ?? "")
      })
      .catch(() => {})

    fetchRequests()
  }, [router, fetchRequests])

  const toggleStatus = async () => {
    setSavingStatus(true)
    const newMessage = isOpen
      ? prompt("Kapanma sebebi (örn: Cuma namazı, öğle arası):") || ""
      : ""
    try {
      const res = await fetch("/api/cemil-torna/shop-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_open: !isOpen, message: newMessage }),
      })
      if (res.ok) {
        setIsOpen(!isOpen)
        setMessage(newMessage)
        toast.success(isOpen ? "Dükkan kapalı konuma alındı" : "Dükkan açık konuma alındı")
      }
    } catch {
      toast.error("İşlem başarısız")
    }
    setSavingStatus(false)
  }

  const updateRequestStatus = async (id: string, status: RequestStatus) => {
    try {
      const supabase = createClient()
      await supabase
        .from("service_requests")
        .update({ status })
        .eq("id", id)
      fetchRequests()
      toast.success("Durum güncellendi")
    } catch {
      toast.error("Güncellenemedi")
    }
  }

  const deleteRequest = async (id: string) => {
    if (!confirm("Talebi silmek istediğinize emin misiniz?")) return
    try {
      const supabase = createClient()
      await supabase.from("service_requests").delete().eq("id", id)
      fetchRequests()
      toast.success("Talep silindi")
    } catch {
      toast.error("Silinemedi")
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <header className="border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/cemil-torna" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Siteye Dön
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        <h1 className="text-2xl font-bold">Cemil Torna Yönetim Paneli</h1>

        {/* Shop Status Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Dükkan Durumu
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {isOpen
                  ? "Dükkan şu anda açık görünüyor"
                  : `Kapalı: ${message || "Sebep belirtilmedi"}`}
              </p>
            </div>
            <button
              onClick={toggleStatus}
              disabled={savingStatus}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isOpen
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                  : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
              }`}
            >
              {savingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isOpen ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
              {isOpen ? "Dükkanı Kapat" : "Dükkanı Aç"}
            </button>
          </div>
        </div>

        {/* Requests Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-amber-500" />
              Gelen Talepler
              {requests.length > 0 && (
                <span className="text-sm font-normal text-amber-500/70">
                  ({requests.filter((r) => r.status === "pending").length} bekleyen)
                </span>
              )}
            </h2>
            <button
              onClick={fetchRequests}
              disabled={loadingRequests}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loadingRequests ? "animate-spin" : ""}`} />
              Yenile
            </button>
          </div>

          {loadingRequests ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm text-zinc-500 mt-3">Yükleniyor...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-8 w-8 text-zinc-700 mx-auto" />
              <p className="text-sm text-zinc-500 mt-3">Henüz talep yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[req.status]}`}>
                          {statusLabels[req.status]}
                        </span>
                        <span className="text-sm font-medium text-white">{req.service_type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="text-zinc-600">👤</span> {req.customer_name}
                        </span>
                        <a
                          href={`tel:${req.customer_phone}`}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
                        >
                          <Phone className="h-3 w-3" /> {req.customer_phone}
                        </a>
                      </div>
                      {(req.vehicle_brand || req.vehicle_model) && (
                        <p className="text-xs text-zinc-500">
                          Araç: {[req.vehicle_brand, req.vehicle_model, req.vehicle_year].filter(Boolean).join(" ")}
                        </p>
                      )}
                      {req.notes && (
                        <p className="text-xs text-zinc-500 mt-1 bg-white/[0.02] rounded-lg p-2">
                          Not: {req.notes}
                        </p>
                      )}
                      <p className="text-xs text-zinc-600">
                        {new Date(req.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={req.status}
                        onChange={(e) => updateRequestStatus(req.id, e.target.value as RequestStatus)}
                        className="text-xs rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key} className="bg-zinc-900">
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteRequest(req.id)}
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
