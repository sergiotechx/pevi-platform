"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { WalletConnect } from "@/components/wallet-connect"
import { useTranslation } from "@/lib/i18n-context"
import { OrganizationCard } from "@/components/organization-card"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, Edit2, Check, X } from "lucide-react"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { t } = useTranslation()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.name || "")

  if (!user) return null

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === user.name) {
      setIsEditingName(false)
      return
    }

    setLoading(true)
    try {
      const res = await updateUser({ name: newName })

      if (!res.success) throw new Error(res.error || "Failed to update name")

      toast.success(t("profile.nameUpdated"))
      setIsEditingName(false)
    } catch (error: any) {
      toast.error(error.message || "Error updating name")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordMismatch"))
      return
    }

    setLoading(true)
    try {
      const res = await updateUser({ password: newPassword })

      if (!res.success) throw new Error(res.error || "Failed to update password")

      toast.success(t("profile.passwordUpdated"))
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Error updating password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-sm text-base-content/60">{t("profile.subtitle")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Account Info - Top Left */}
          <Card className="border-base-300/50 flex flex-col h-full">
            <CardHeader><CardTitle className="text-base">{t("profile.accountInfo")}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">{user.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 py-1 px-2 text-lg font-semibold bg-base-100/50"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateName()
                          if (e.key === 'Escape') setIsEditingName(false)
                        }}
                      />
                      <button
                        onClick={handleUpdateName}
                        className="p-1 hover:bg-primary/20 rounded text-primary"
                        disabled={loading}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1 hover:bg-error/20 rounded text-error"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-base-content truncate">{user.name}</p>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 hover:bg-base-300 rounded transition-colors text-primary/70 hover:text-primary"
                        title="Editar nombre"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-base-content/60 truncate">{user.email}</p>
                  <span className="mt-1 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">{user.role.replace("_", " ")}</span>
                </div>
              </div>
              <div className="rounded-lg border border-base-300/50 bg-base-300/30 p-3 mt-auto">
                <p className="text-xs text-base-content/60">{t("profile.userId")}</p>
                <p className="font-mono text-sm text-base-content">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Organization - Left Side */}
          <OrganizationCard />
        </div>

        <div className="flex flex-col gap-6">
          {/* Wallet - Right Side */}
          <div className="h-full">
            <WalletConnect />
          </div>

          {/* Security / Password - Right Side */}
          <Card className="border-base-300/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{t("profile.security")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t("profile.newPassword")}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-base-200/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t("profile.confirmPassword")}</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-base-200/50"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t("common.loading") : t("profile.updatePassword")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
