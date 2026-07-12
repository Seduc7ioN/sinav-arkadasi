"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Loader2 } from "lucide-react"
import { useState } from "react"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Çıkış
    </button>
  )
}
