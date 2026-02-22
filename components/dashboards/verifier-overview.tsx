"use client"

import { useState, useEffect } from "react"
import { FileCheck, CheckCircle, Bell, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

interface RecentEvaluation {
  activity_id: number
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

interface DashboardData {
  pendingAudits: number
  verified: number
  assignedCampaigns: number
  recentEvaluations: RecentEvaluation[]
}

export function VerifierOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData>({
    pendingAudits: 0,
    verified: 0,
    assignedCampaigns: 0,
    recentEvaluations: [],
  })

  useEffect(() => {
    if (!user) return
    fetch(`/api/verifier/dashboard?userId=${user.id}`)
      .then((res) => res.json())
      .then((json: DashboardData) => setData(json))
  }, [user])

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient">{t("verOverview.title")}</h1>
        <p className="mt-1 text-sm text-base-content/50">{t("verOverview.subtitle")}</p>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-gradient-subtle p-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-base-content">{t("verOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t("verOverview.pendingAudits")} value={data.pendingAudits} icon={Clock} sub={t("verOverview.awaitingVerification")} />
        <StatCard title={t("verOverview.verified")} value={data.verified} icon={CheckCircle} />
        <StatCard title={t("verOverview.assignedCampaigns")} value={data.assignedCampaigns} icon={FileCheck} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("verOverview.recentEvaluations")}</CardTitle></CardHeader>
        <CardContent>
          {data.recentEvaluations.length === 0 ? (
            <p className="text-sm text-base-content/50">{t("verOverview.noEvaluations")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.recentEvaluations.map((ev) => (
                <div key={ev.activity_id} className="flex items-center justify-between rounded-xl border border-base-300/30 bg-base-300/20 p-4 transition-colors hover:bg-base-300/40">
                  <div>
                    <p className="text-sm font-semibold text-base-content">{ev.milestone.campaign.title}</p>
                    <p className="text-xs text-base-content/50">{ev.milestone.name} · {ev.campaignBeneficiary.user.fullName}</p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
