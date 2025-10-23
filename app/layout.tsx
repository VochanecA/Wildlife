import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { ClearAuthCookies } from "./clear-auth-cookies"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Airport Wildlife Management System",
  description: "Professional wildlife hazard management compliant with EASA and ICAO regulations",
  generator: "v0.app",
  manifest: "/manifest.json",
  // themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wildlife Mgmt",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        {/* This will clear problematic cookies on error */}
        <Suspense fallback={null}>
          <ClearAuthCookies />
        </Suspense>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}