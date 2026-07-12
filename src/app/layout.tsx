import type { Metadata, Viewport } from "next"
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
  icons: {
    icon: "/icons/icon-32.png",
    apple: "/icons/icon-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "Sınav Arkadaşı",
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  themeColor: "#6366F1",
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
