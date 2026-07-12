import { createClient } from "./server"

export async function getUserFromRequest(request: Request) {
  // Onceki supabase client'ini cookie'den oku
  const cookieClient = await createClient()
  const { data: cookieUser } = await cookieClient.auth.getUser()
  if (cookieUser.user) {
    return cookieUser.user
  }

  // Yoksa Authorization: Bearer header'indan oku
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return null
  }

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
}
