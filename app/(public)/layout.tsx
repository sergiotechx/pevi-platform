"use client"

import { PublicHeader } from "@/components/public-header"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-base-100">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-base-300/50 bg-base-200/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-base-content/50 md:flex-row lg:px-8">
          <p>PEVI &mdash; Programa de Est&iacute;mulos con Verificaci&oacute;n de Impacto</p>
          <p>&copy; {new Date().getFullYear()} PEVI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
