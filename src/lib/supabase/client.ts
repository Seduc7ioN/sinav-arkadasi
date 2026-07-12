import { createBrowserClient } from "@supabase/ssr"

const REMEMBER_ME_KEY = "sa-remember-me"

function getAllCookies() {
  if (typeof document === "undefined") return []
  return document.cookie.split(";").reduce<{ name: string; value: string }[]>((acc, cookie) => {
    const [name, ...rest] = cookie.trim().split("=")
    if (!name) return acc
    acc.push({ name, value: decodeURIComponent(rest.join("=")) })
    return acc
  }, [])
}

function setCookie(name: string, value: string, options: Record<string, unknown> = {}) {
  if (typeof document === "undefined") return
  const encodedValue = encodeURIComponent(value)
  const opts = Object.entries(options)
    .map(([key, val]) => {
      if (val === true) return key
      if (val === false || val === undefined || val === null) return ""
      return `${key}=${val}`
    })
    .filter(Boolean)
    .join("; ")
  document.cookie = `${name}=${encodedValue}${opts ? `; ${opts}` : ""}`
}

function shouldRememberMe(): boolean {
  if (typeof window === "undefined") return true
  try {
    const value = window.localStorage.getItem(REMEMBER_ME_KEY)
    return value === null || value === "true"
  } catch {
    return true
  }
}

export function setRememberMe(value: boolean) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(REMEMBER_ME_KEY, String(value))
  } catch {
    // ignore
  }
}

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

  const rememberMe = shouldRememberMe()

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return getAllCookies()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (!rememberMe) {
            // Beni hatırla seçilmediyse tarayıcı kapatılınca silinen oturum çerezi kullan.
            const { expires, maxAge, ...sessionOptions } = options
            void expires
            void maxAge
            setCookie(name, value, sessionOptions)
          } else {
            setCookie(name, value, options)
          }
        })
      },
    },
  })
}
