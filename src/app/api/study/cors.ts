import { NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  "http://localhost:4444",
  "http://localhost:3000",
  "http://localhost:3001",
]

export function corsResponse(body: unknown, init?: ResponseInit) {
  const origin =
    (typeof init?.headers === "object" &&
      "get" in init.headers &&
      (init.headers as Headers).get("origin")) ||
    ""

  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "*"

  return NextResponse.json(body, {
    ...init,
    headers: {
      ...((init?.headers as Record<string, string>) || {}),
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}

export function handleCorsPreflight() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}
