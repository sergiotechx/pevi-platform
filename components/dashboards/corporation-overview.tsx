"use client"

import Link from "next/link"
import { Megaphone, Users, Target, PlusCircle, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { campaigns, users as allUsers } from "@/lib/mock-data"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

export function CorporationOverview() {
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const activeCampaigns = campaigns.filter((c) => c.status === "active")
  const totalBeneficiaries = new Set(campaigns.flatMap((c) => c.beneficiaries)).size
  const totalMilestones = campaigns.reduce((acc, c) => acc + c.milestones.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("corpOverview.title")}</h1>
          <p className="text-sm text-base-content/60">{t("corpOverview.subtitle")}</p>
        </div>
        <Button asChild><Link href="/dashboard/campaigns/create"><PlusCircle className="mr-2 h-4 w-4" />{t("corpOverview.newCampaign")}</Link></Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm text-base-content">{t("corpOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t("corpOverview.activeCampaigns")} value={activeCampaigns.length} icon={Megaphone} sub={t("corpOverview.total", { count: campaigns.length })} />
        <StatCard title={t("corpOverview.totalBeneficiaries")} value={totalBeneficiaries} icon={Users} />
        <StatCard title={t("corpOverview.totalMilestones")} value={totalMilestones} icon={Target} sub={t("corpOverview.approved", { count: campaigns.reduce((a, c) => a + c.milestones.filter((m) => m.status === "approved").length, 0) })} />
      </div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("corpOverview.recentCampaigns")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {campaigns.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                <div>
                  <p className="text-sm font-medium text-base-content">{c.name}</p>
                  <p className="text-xs text-base-content/60">{t("corpOverview.milestonesAndBeneficiaries", { milestones: c.milestones.length, beneficiaries: c.beneficiaries.length })}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
