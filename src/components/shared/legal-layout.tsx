import Link from "next/link"
import { Sparkles } from "lucide-react"

interface LegalLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Sınav Arkadaşı</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 lg:px-8 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="prose prose-slate max-w-none">{children}</div>
      </main>
    </div>
  )
}
