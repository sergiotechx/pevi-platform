"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { WalletConnect } from "@/components/wallet-connect"
import { useTranslation } from "@/lib/i18n-context"

export default function ProfilePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("profile.title")}</h1><p className="text-sm text-base-content/60">{t("profile.subtitle")}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-base-300/50">
          <CardHeader><CardTitle className="text-base">{t("profile.accountInfo")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">{user.name.charAt(0)}</div>
              <div>
                <p className="text-lg font-semibold text-base-content">{user.name}</p>
                <p className="text-sm text-base-content/60">{user.email}</p>
                <span className="mt-1 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">{user.role.replace("_", " ")}</span>
              </div>
            </div>
            <div className="rounded-lg border border-base-300/50 bg-base-300/30 p-3">
              <p className="text-xs text-base-content/60">{t("profile.userId")}</p>
              <p className="font-mono text-sm text-base-content">{user.id}</p>
            </div>
          </CardContent>
        </Card>
        <WalletConnect />
      </div>
    </div>
  )
}
