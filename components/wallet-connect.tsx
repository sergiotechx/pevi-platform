"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { Wallet, Check, Copy, Loader2, Unplug, AlertCircle, Pencil, X } from "lucide-react"
import { isFreighterInstalled, STELLAR_NETWORK } from "@/lib/stellar"

export function WalletConnect() {
  const { user, connectWallet, disconnectWallet, updateWallet } = useAuth()
  const { t } = useTranslation()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualAddress, setManualAddress] = useState("")
  const [updateMode, setUpdateMode] = useState(false)
  const [updateAddress, setUpdateAddress] = useState("")
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    isFreighterInstalled().then(setFreighterInstalled)
  }, [])

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
        setError(t(result.error || "wallet.connectionFailed"))
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
    setUpdateMode(false)
  }

  const handleUpdateSave = async () => {
    if (!updateAddress.startsWith("G") || updateAddress.length < 20) {
      setError(t("wallet.invalidAddress"))
      return
    }
    const result = await updateWallet(updateAddress)
    if (result.success) {
      setUpdateMode(false)
      setUpdateAddress("")
      setSuccess(t("wallet.addressSaved"))
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(t(result.error || "wallet.unexpectedError"))
    }
  }

  const handleManualSave = async () => {
    if (!manualAddress.startsWith("G") || manualAddress.length < 20) {
      setError(t("wallet.invalidAddress"))
      return
    }
    const result = await updateWallet(manualAddress)
    if (result.success) {
      setManualMode(false)
      setManualAddress("")
      setSuccess(t("wallet.addressSaved"))
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(t(result.error || "wallet.unexpectedError"))
    }
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" />{t("wallet.stellar")}
          </CardTitle>
          <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STELLAR_NETWORK === 'public' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
            {STELLAR_NETWORK}
          </div>
        </div>
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
        {freighterInstalled === false && (
          <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="text-xs text-warning block text-center mt-2">
            Instala Freighter para conectar tu wallet Stellar
          </a>
        )}

        {connected ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">{t("wallet.connected")}</span>
            </div>
            <div className="rounded-lg border border-base-300/50 bg-base-300/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-base-content/60">{t("wallet.walletAddress")}</p>
                {!updateMode && (
                  <button
                    onClick={() => {
                      setUpdateAddress(user.walletAddress || "");
                      setUpdateMode(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="p-1 hover:bg-base-300 rounded transition-colors text-primary/70 hover:text-primary"
                    title={t("wallet.update")}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
              {updateMode ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Input
                    value={updateAddress}
                    onChange={(e) => setUpdateAddress(e.target.value)}
                    placeholder={t("wallet.addressPlaceholder")}
                    className="h-8 py-1 px-2 bg-base-100/50 font-mono text-xs"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateSave}
                      className="p-1 hover:bg-primary/20 rounded text-primary"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setUpdateMode(false); setUpdateAddress(""); setError("") }}
                      className="p-1 hover:bg-error/20 rounded text-error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 break-all font-mono text-sm text-base-content" title={user.walletAddress}>
                  {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-6)}
                </p>
              )}
            </div>

            {!updateMode && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <><Check className="mr-1 h-3 w-3" />{t("wallet.copied")}</> : <><Copy className="mr-1 h-3 w-3" />{t("wallet.copyAddress", { defaultValue: "Copiar Dirección" })}</>}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-error hover:text-error bg-transparent ml-auto">
                  <Unplug className="mr-1 h-3 w-3" />{t("wallet.disconnect")}
                </Button>
              </div>
            )}
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
