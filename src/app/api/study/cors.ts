import { NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  "http://localhost:4444",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://sinav-arkadasi.vercel.app",
]

function getAllowOrigin(request?: Request) {
  const origin = request?.headers.get("origin") || ""
  return ALLOWED_ORIGINS.includes(origin) ? origin : "*"
}

export function corsResponse(
  body: unknown,
  init?: ResponseInit,
  request?: Request
) {
  const allowOrigin = getAllowOrigin(request)

  const baseHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    "Access-Control-Allow-Credentials": "true",
  }

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        baseHeaders[key] = value
      })
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        baseHeaders[key] = value
      })
    } else {
      Object.assign(baseHeaders, init.headers)
    }
  }

  return NextResponse.json(body, {
    ...init,
    headers: baseHeaders,
  })
}

export function handleCorsPreflight(request?: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": getAllowOrigin(request),
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}
