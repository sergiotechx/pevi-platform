"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

type MilestoneItem = { milestone_id: number; name: string | null; description: string | null; total_amount: number | null; currency: string | null; status: string | null }
type ActivityItem = { activity_id: number; milestone_id: number; evidence_status: string | null; verification_status: string | null }
type EnrollmentItem = {
  campaign: { campaign_id: number; title: string; status: string | null; milestones?: MilestoneItem[] }
  activities?: ActivityItem[]
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/campaign-beneficiaries?user_id=${user.id}&include=full`)
      .then((r) => r.json())
      .then((data: EnrollmentItem[]) => setEnrollments(Array.isArray(data) ? data : []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("progress.title")}</h1><p className="text-sm text-base-content/60">{t("progress.subtitle")}</p></div>
      {loading ? (
        <p className="text-sm text-base-content/60">{t("common.loading")}</p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-base-content/60">{t("progress.none")}</p>
      ) : (
        enrollments.map((e) => {
          const c = e.campaign
          const milestones = c.milestones ?? []
          const activitiesByMilestone = new Map((e.activities ?? []).map((a) => [a.milestone_id, a]))
          return (
            <Card key={c.campaign_id} className="border-base-300/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.title}</CardTitle>
                <StatusBadge status={c.status ?? "draft"} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {milestones.map((m) => {
                    const activity = activitiesByMilestone.get(m.milestone_id)
                    const status = activity?.verification_status ?? activity?.evidence_status ?? m.status ?? "pending"
                    const amount = m.total_amount ?? 0
                    const currency = m.currency ?? "USDC"
                    return (
                      <div key={m.milestone_id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                        <div>
                          <p className="text-sm font-medium text-base-content">{m.name ?? ""}</p>
                          <p className="text-xs text-base-content/60">{m.description ?? ""}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-base-content/60">{t("progress.reward", { amount })}</span>
                          <StatusBadge status={status} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
