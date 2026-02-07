"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { Wallet, Check, Copy, Loader2, Unplug, AlertCircle } from "lucide-react"

export function WalletConnect() {
  const { user, connectWallet, disconnectWallet, updateWallet } = useAuth()
  const { t } = useTranslation()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualAddress, setManualAddress] = useState("")

  if (!user) return null
  const connected = !!user.walletAddress

  const handleConnect = async () => {
    setError("")
    setSuccess("")
    setConnecting(true)
    try {
      const result = await connectWallet()
      if (result.success) {
        setSuccess(t("wallet.connectedSuccess"))
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error || t("wallet.connectionFailed"))
      }
    } catch {
      setError(t("wallet.unexpectedError"))
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setSuccess("")
    setError("")
  }

  const handleManualSave = () => {
    if (!manualAddress.startsWith("G") || manualAddress.length < 20) {
      setError(t("wallet.invalidAddress"))
      return
    }
    updateWallet(manualAddress)
    setManualMode(false)
    setManualAddress("")
    setSuccess(t("wallet.addressSaved"))
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleCopy = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="border-base-300/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-5 w-5 text-primary" />{t("wallet.stellar")}</CardTitle>
        <CardDescription>{t("wallet.connectDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />{success}
          </div>
        )}

        {connected ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">{t("wallet.connected")}</span>
            </div>
            <div className="rounded-lg border border-base-300/50 bg-base-300/30 p-3">
              <p className="text-xs text-base-content/60">{t("wallet.walletAddress")}</p>
              <p className="mt-1 break-all font-mono text-sm text-base-content">{user.walletAddress}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <><Check className="mr-1 h-3 w-3" />{t("wallet.copied")}</> : <><Copy className="mr-1 h-3 w-3" />{t("wallet.copyAddress")}</>}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-error hover:text-error bg-transparent">
                <Unplug className="mr-1 h-3 w-3" />{t("wallet.disconnect")}
              </Button>
            </div>
          </div>
        ) : manualMode ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>{t("wallet.stellarAddress")}</Label>
              <Input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder={t("wallet.addressPlaceholder")} className="bg-base-100/50 font-mono text-sm" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleManualSave}>{t("wallet.saveAddress")}</Button>
              <Button variant="outline" size="sm" onClick={() => setManualMode(false)}>{t("common.cancel")}</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("wallet.connecting")}</> : <><Wallet className="mr-2 h-4 w-4" />{t("wallet.connect")}</>}
            </Button>
            {connecting && (
              <div className="flex flex-col gap-1">
                <div className="h-1.5 rounded-full bg-base-300 overflow-hidden"><div className="h-full animate-pulse rounded-full bg-primary/60 w-2/3" /></div>
                <p className="text-xs text-base-content/60">{t("wallet.connectingNetwork")}</p>
              </div>
            )}
            <button onClick={() => setManualMode(true)} className="text-xs text-base-content/60 hover:text-primary">
              {t("wallet.orManual")}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
