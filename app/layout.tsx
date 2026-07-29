import type { Metadata, Viewport } from "next"

import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

export const metadata: Metadata = {
  applicationName: "Court Ready",
  title: "Court Ready",
  description:
    "A calm daily dashboard for energy, strength, recovery, and pickleball readiness.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Court Ready",
  },
}

export const viewport: Viewport = {
  // Matches the surface token in globals.css for each scheme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#15161a" },
  ],
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
