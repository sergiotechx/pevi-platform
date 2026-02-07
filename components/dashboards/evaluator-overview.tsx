"use client"

import Link from "next/link"
import { ClipboardCheck, FileCheck, CheckCircle, Bell, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { campaigns, evidences, evaluations } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

export function EvaluatorOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  if (!user) return null

  const assignedCampaigns = campaigns.filter((c) => c.evaluatorId === user.id)
  const pendingEvidence = evidences.filter((e) => {
    const c = campaigns.find((ca) => ca.id === e.campaignId)
    return c?.evaluatorId === user.id && e.status === "pending"
  })
  const myEvaluations = evaluations.filter((ev) => ev.evaluatorId === user.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("evalOverview.title")}</h1>
          <p className="text-sm text-base-content/60">{t("evalOverview.subtitle")}</p>
        </div>
        <Button asChild><Link href="/dashboard/review"><ClipboardCheck className="mr-2 h-4 w-4" />{t("evalOverview.reviewPending")}</Link></Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm text-base-content">{t("evalOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t("evalOverview.pendingReviews")} value={pendingEvidence.length} icon={Clock} sub={t("evalOverview.awaitingEvaluation")} />
        <StatCard title={t("evalOverview.totalEvaluations")} value={myEvaluations.length} icon={FileCheck} />
        <StatCard title={t("evalOverview.assignedCampaigns")} value={assignedCampaigns.length} icon={CheckCircle} />
      </div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("evalOverview.pendingEvidence")}</CardTitle></CardHeader>
        <CardContent>
          {pendingEvidence.length === 0 ? (
            <p className="text-sm text-base-content/60">{t("evalOverview.noPending")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingEvidence.map((e) => {
                const c = campaigns.find((ca) => ca.id === e.campaignId)
                const m = c?.milestones.find((mi) => mi.id === e.milestoneId)
                return (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                    <div>
                      <p className="text-sm font-medium text-base-content">{m?.title || t("common.milestones")}</p>
                      <p className="text-xs text-base-content/60">{c?.name} &middot; {t("common.submitted")} {e.submittedAt}</p>
                    </div>
                    <Link href="/dashboard/review" className="text-xs text-primary hover:underline">{t("evalOverview.review")}</Link>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
