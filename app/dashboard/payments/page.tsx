"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { payments, campaigns, users } from "@/lib/mock-data"
import { useTranslation } from "@/lib/i18n-context"

export default function PaymentsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("payments.title")}</h1><p className="text-sm text-base-content/60">{t("payments.subtitle")}</p></div>
      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("payments.history")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {payments.map((p) => {
              const c = campaigns.find((ca) => ca.id === p.campaignId)
              const b = users.find((u) => u.id === p.beneficiaryId)
              const m = c?.milestones.find((mi) => mi.id === p.milestoneId)
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-base-content">{m?.title || t("payments.milestone")}</p>
                    <p className="text-xs text-base-content/60">{c?.name} &middot; {b?.name} &middot; {p.paidAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-base-content">{t("payments.amount", { amount: p.amount, currency: p.currency })}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
