import React from "react"
import type { Metadata, Viewport } from "next"
import { Roboto, Plus_Jakarta_Sans } from "next/font/google"
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

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta"
})

export const metadata: Metadata = {
  title: "PEVI - Impact Verification Incentive Program",
  description: "Manage incentive-based programs with transparent verification and Web3-powered rewards.",
}

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
}

import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
                <Toaster closeButton position="top-right" richColors />
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
