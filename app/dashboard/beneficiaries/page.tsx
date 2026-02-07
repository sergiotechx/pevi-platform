"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { users, campaigns } from "@/lib/mock-data"
import { useTranslation } from "@/lib/i18n-context"

export default function BeneficiariesPage() {
  const { t } = useTranslation()
  const beneficiaries = users.filter((u) => u.role === "beneficiary")

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("beneficiaries.title")}</h1><p className="text-sm text-base-content/60">{t("beneficiaries.subtitle")}</p></div>
      <div className="flex flex-col gap-3">
        {beneficiaries.map((b) => {
          const enrolled = campaigns.filter((c) => c.beneficiaries.includes(b.id))
          return (
            <Card key={b.id} className="border-base-300/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{b.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-content">{b.name}</p>
                  <p className="text-xs text-base-content/60">{b.email}</p>
                </div>
                <span className="text-xs text-base-content/60">{t("beneficiaries.campaigns", { count: enrolled.length })}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
