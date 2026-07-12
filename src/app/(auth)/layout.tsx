import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span>Sınav Arkadaşı</span>
      </Link>
      {children}
    </div>
  )
}
