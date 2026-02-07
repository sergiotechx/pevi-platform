import React from "react"
import type { Metadata, Viewport } from "next"
import { Roboto } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n-context"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto"
})

export const metadata: Metadata = {
  title: "PEVI - Programa de Estimulos con Verificacion de Impacto",
  description: "Manage incentive-based programs with transparent verification and Web3-powered rewards.",
}

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
