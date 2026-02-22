"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Megaphone, Users, Target, PlusCircle, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

type CampaignItem = {
  campaign_id: number
  title: string
  status: string | null
  campaignBeneficiaries?: { campaignBeneficiary_id: number }[]
  milestones?: { milestone_id: number; status: string | null }[]
}

export function CorporationOverview() {
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/campaigns?include=full`)
      .then((r) => r.json())
      .then((data: CampaignItem[]) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false))
  }, [])

  const activeCampaigns = campaigns.filter((c) => c.status === "active")
  const totalBeneficiaries = new Set(campaigns.flatMap((c) => (c.campaignBeneficiaries ?? []).map((cb) => cb.campaignBeneficiary_id))).size
  const totalMilestones = campaigns.reduce((acc, c) => acc + (c.milestones?.length ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient">{t("corpOverview.title")}</h1>
          <p className="mt-1 text-sm text-base-content/50">{t("corpOverview.subtitle")}</p>
        </div>
        <Button asChild><Link href="/dashboard/campaigns/create"><PlusCircle className="mr-2 h-4 w-4" />{t("corpOverview.newCampaign")}</Link></Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-gradient-subtle p-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-base-content">{t("corpOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t("corpOverview.activeCampaigns")} value={loading ? "—" : activeCampaigns.length} icon={Megaphone} sub={t("corpOverview.total", { count: campaigns.length })} />
        <StatCard title={t("corpOverview.totalBeneficiaries")} value={loading ? "—" : totalBeneficiaries} icon={Users} />
        <StatCard title={t("corpOverview.totalMilestones")} value={loading ? "—" : totalMilestones} icon={Target} sub={t("corpOverview.approved", { count: campaigns.reduce((a, c) => a + (c.milestones ?? []).filter((m) => m.status === "approved").length, 0) })} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("corpOverview.recentCampaigns")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {loading ? (
              <p className="text-sm text-base-content/50">{t("common.loading")}</p>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-base-content/50">{t("notifications.empty")}</p>
            ) : (
              campaigns.slice(0, 3).map((c) => (
                <div key={c.campaign_id} className="flex items-center justify-between rounded-xl border border-base-300/30 bg-base-300/20 p-4 transition-colors hover:bg-base-300/40">
                  <div>
                    <p className="text-sm font-semibold text-base-content">{c.title}</p>
                    <p className="text-xs text-base-content/50">{t("corpOverview.milestonesAndBeneficiaries", { milestones: c.milestones?.length ?? 0, beneficiaries: c.campaignBeneficiaries?.length ?? 0 })}</p>
                  </div>
                  <StatusBadge status={c.status ?? "draft"} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
