"use client"

import { useState } from "react"
import { Wallet, Copy, Check, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

function truncate(addr: string) {
  return addr.length > 16 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

export function WalletStatus() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const { disconnectWallet } = useAuth()
  const { t } = useTranslation()

  if (!user) return null

  const connected = !!user.walletAddress

  const handleCopy = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!connected) {
    return (
      <a href="/dashboard/profile" className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
        <Wallet className="h-3.5 w-3.5" />
        {t("wallet.connect")}
      </a>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {truncate(user.walletAddress!)}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3" sideOffset={8}>
        <p className="text-xs text-base-content/60">{t("wallet.stellar")}</p>
        <p className="mt-1 break-all font-mono text-xs text-base-content">{user.walletAddress}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? t("wallet.copied") : t("wallet.copy")}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs text-error hover:text-error bg-transparent" onClick={disconnectWallet}>
            <Unplug className="mr-1 h-3 w-3" />
            {t("wallet.disconnect")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
