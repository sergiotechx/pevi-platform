"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

interface ActivityRow {
  activity_id: number
  verification_note: string | null
  milestone: {
    name: string | null
    campaign: {
      campaign_id: number
      title: string
    }
  }
  campaignBeneficiary: {
    user: { fullName: string }
  }
}

export default function VerifiedPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [activities, setActivities] = useState<ActivityRow[]>([])

  useEffect(() => {
    if (!user) return
    fetch(`/api/verifier/verified?userId=${user.id}`)
      .then((res) => res.json())
      .then((data: ActivityRow[]) => setActivities(data))
  }, [user])

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("verified.title")}</h1>
        <p className="text-sm text-base-content/60">{t("verified.subtitle")}</p>
      </div>
      {activities.length === 0 ? (
        <p className="text-sm text-base-content/60">{t("verified.none")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((a) => (
            <Card key={a.activity_id} className="border-base-300/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-base-content">{a.milestone.campaign.title}</p>
                  <p className="text-xs text-base-content/60">{a.milestone.name}</p>
                  <p className="text-xs text-base-content/60">
                    <span className="text-base-content/40">{t("verified.beneficiary")}: </span>
                    {a.campaignBeneficiary.user.fullName}
                  </p>
                  {a.verification_note && (
                    <p className="text-xs text-base-content/60 mt-1">{a.verification_note}</p>
                  )}
                </div>
                <StatusBadge status="approved" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
