"use client"

import Link from "next/link"
import { ShieldCheck, FileCheck, CheckCircle, Bell, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { campaigns, evaluations } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

export function VerifierOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  if (!user) return null

  const assignedCampaigns = campaigns.filter((c) => c.verifierId === user.id)
  const assignedEvalIds = new Set(assignedCampaigns.map((c) => c.id))
  const relevantEvals = evaluations.filter((ev) => {
    const evidence = campaigns.flatMap((c) => c.milestones).length > 0
    return true
  })
  const pendingAudits = evaluations.filter((ev) => ev.verificationStatus === "pending")
  const verified = evaluations.filter((ev) => ev.verificationStatus === "verified")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("verOverview.title")}</h1>
          <p className="text-sm text-base-content/60">{t("verOverview.subtitle")}</p>
        </div>
        <Button asChild><Link href="/dashboard/audit"><ShieldCheck className="mr-2 h-4 w-4" />{t("verOverview.auditPending")}</Link></Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm text-base-content">{t("verOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t("verOverview.pendingAudits")} value={pendingAudits.length} icon={Clock} sub={t("verOverview.awaitingVerification")} />
        <StatCard title={t("verOverview.verified")} value={verified.length} icon={CheckCircle} />
        <StatCard title={t("verOverview.assignedCampaigns")} value={assignedCampaigns.length} icon={FileCheck} />
      </div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("verOverview.recentEvaluations")}</CardTitle></CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <p className="text-sm text-base-content/60">{t("verOverview.noEvaluations")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {evaluations.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-base-content">{t("verOverview.evidence", { id: ev.evidenceId })}</p>
                    <p className="text-xs text-base-content/60">{t("verOverview.decisionDate", { decision: ev.decision, date: ev.evaluatedAt })}</p>
                  </div>
                  <StatusBadge status={ev.verificationStatus} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
