import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cemil Torna | Disk Kampana Volant Taşlama & Kaynak Atölyesi - Adana",
  description:
    "Cemil Kurt Torna ve Akis Tamir Atölyesi. Adana Yüreğir'de disk taşlama, kampana taşlama, volant taşlama, kaynak ve pres işleri. CNC hassasiyetiyle profesyonel çözümler.",
  keywords: [
    "cemil torna",
    "disk taşlama",
    "kampana taşlama",
    "volant taşlama",
    "kaynak atölyesi",
    "adana torna",
    "oto tamir adana",
    "fren diski taşlama",
  ],
  manifest: "/manifest-cemiltorna.json",
  icons: {
    icon: "/favicon-cemiltorna.svg",
    apple: "/cemiltorna-logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "CemilTorna",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export default function CemilTornaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <meta name="theme-color" content="#0a0a0b" />
      {children}
    </>
  )
}
