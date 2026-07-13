import { createClient } from "./server"

export async function getUserFromRequest(request: Request) {
  try {
    // Önce cookie'den oku
    const cookieClient = await createClient()
    const { data: cookieUser } = await cookieClient.auth.getUser()
    if (cookieUser.user) {
      return cookieUser.user
    }
  } catch (err) {
    console.error("[request-auth] cookie auth error:", err instanceof Error ? err.message : err)
  }

  // Yoksa Authorization: Bearer header'indan oku
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return null
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (err) {
    console.error("[request-auth] bearer auth error:", err instanceof Error ? err.message : err)
    return null
  }
}
