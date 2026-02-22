"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationInbox } from "@/components/notification-inbox"
import { WalletStatus } from "@/components/wallet-status"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function DashboardHeader() {
  return (
    <div>
      <header className="relative z-[100] flex h-14 items-center justify-between border-b border-base-300/30 px-4 glass">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <WalletStatus />
          <NotificationInbox />
        </div>
      </header>
      {/* Gradient accent line below header */}
      <div className="h-[1px] gradient-line" />
    </div>
  )
}
