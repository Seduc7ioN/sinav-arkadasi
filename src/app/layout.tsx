import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Sınav Arkadaşı - Notunu Çek, Sorular Hazır",
  description:
    "AI destekli öğrenci çalışma asistanı. Notlarını fotoğrafla, PDF veya slayt yükle; sana özel çoktan seçmeli sorular anında oluştursun.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
