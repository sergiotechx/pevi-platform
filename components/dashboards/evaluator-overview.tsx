"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileCheck, CheckCircle, Bell, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

interface PendingReview {
  activity_id: number
  activity_observation: string | null
  evidence_ref: string | null
  milestone: {
    milestone_id: number
    name: string | null
    campaign: {
      campaign_id: number
      title: string
    }
  }
}

interface DashboardData {
  assignedCampaigns: { campaign_id: number; title: string; status: string | null }[]
  pendingReviews: PendingReview[]
  totalEvaluations: number
}

export function EvaluatorOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!user) return
    fetch(`/api/evaluator/dashboard?userId=${user.id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
  }, [user])

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient">{t("evalOverview.title")}</h1>
          <p className="mt-1 text-sm text-base-content/50">{t("evalOverview.subtitle")}</p>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-gradient-subtle p-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-base-content">{t("evalOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t("evalOverview.pendingReviews")} value={data?.pendingReviews.length ?? 0} icon={Clock} sub={t("evalOverview.awaitingEvaluation")} />
        <StatCard title={t("evalOverview.totalEvaluations")} value={data?.totalEvaluations ?? 0} icon={FileCheck} />
        <StatCard title={t("evalOverview.assignedCampaigns")} value={data?.assignedCampaigns.length ?? 0} icon={CheckCircle} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("evalOverview.pendingEvidence")}</CardTitle></CardHeader>
        <CardContent>
          {!data || data.pendingReviews.length === 0 ? (
            <p className="text-sm text-base-content/50">{t("evalOverview.noPending")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.pendingReviews.map((a) => (
                <div key={a.activity_id} className="flex items-center justify-between rounded-xl border border-base-300/30 bg-base-300/20 p-4 transition-colors hover:bg-base-300/40">
                  <div>
                    <p className="text-sm font-semibold text-base-content">{a.milestone.name || t("common.milestones")}</p>
                    <p className="text-xs text-base-content/50">{a.milestone.campaign.title}</p>
                  </div>
                  <Link href="/dashboard/review" className="text-xs font-medium text-primary hover:underline">{t("evalOverview.review")}</Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
