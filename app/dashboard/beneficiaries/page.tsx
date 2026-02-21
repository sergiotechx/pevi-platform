"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n-context"

type BeneficiaryUser = {
  user_id: number
  fullName: string
  email: string
  campaignBeneficiaries?: { campaignBeneficiary_id: number }[]
}

export default function BeneficiariesPage() {
  const { t } = useTranslation()
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users?role=beneficiary&include=full`)
      .then((r) => r.json())
      .then((data: BeneficiaryUser[]) => setBeneficiaries(Array.isArray(data) ? data : []))
      .catch(() => setBeneficiaries([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex flex-col gap-6"><p className="text-sm text-base-content/60">{t("common.loading")}</p></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("beneficiaries.title")}</h1><p className="text-sm text-base-content/60">{t("beneficiaries.subtitle")}</p></div>
      <div className="flex flex-col gap-3">
        {beneficiaries.map((b) => {
          const enrolled = b.campaignBeneficiaries?.length ?? 0
          return (
            <Card key={b.user_id} className="border-base-300/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{b.fullName.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-content">{b.fullName}</p>
                  <p className="text-xs text-base-content/60">{b.email}</p>
                </div>
                <span className="text-xs text-base-content/60">{t("beneficiaries.campaigns", { count: enrolled })}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

