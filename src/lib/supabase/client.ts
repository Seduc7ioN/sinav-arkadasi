import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (typeof window === "undefined") {
      return null as unknown as ReturnType<typeof createBrowserClient>
    }
    throw new Error(
      "Supabase bağlantı bilgileri eksik. Lütfen NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenlerini ayarlayın."
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
