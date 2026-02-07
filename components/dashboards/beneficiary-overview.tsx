"use client"

import Link from "next/link"
import { Target, Upload, CheckCircle, Bell, Compass } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { campaigns, evidences, invitations } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

export function BeneficiaryOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  if (!user) return null

  const myCampaigns = campaigns.filter((c) => c.beneficiaries.includes(user.id))
  const myEvidences = evidences.filter((e) => e.beneficiaryId === user.id)
  const approvedMilestones = myCampaigns.flatMap((c) => c.milestones).filter((m) => m.status === "approved")
  const pendingInvitations = invitations.filter((i) => i.beneficiaryId === user.id && i.status === "pending")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("benOverview.title")}</h1>
          <p className="text-sm text-base-content/60">{t("benOverview.subtitle")}</p>
        </div>
        <Button asChild variant="outline"><Link href="/dashboard/explore"><Compass className="mr-2 h-4 w-4" />{t("benOverview.explore")}</Link></Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm text-base-content">{t("benOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("benOverview.myCampaigns")} value={myCampaigns.length} icon={Target} />
        <StatCard title={t("benOverview.evidenceSubmitted")} value={myEvidences.length} icon={Upload} />
        <StatCard title={t("benOverview.milestonesApproved")} value={approvedMilestones.length} icon={CheckCircle} />
        <StatCard title={t("benOverview.pendingInvitations")} value={pendingInvitations.length} icon={Bell} />
      </div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("benOverview.myCampaigns")}</CardTitle></CardHeader>
        <CardContent>
          {myCampaigns.length === 0 ? (
            <p className="text-sm text-base-content/60">{t("benOverview.noCampaigns")} <Link href="/dashboard/explore" className="text-primary hover:underline">{t("benOverview.exploreLink")}</Link>.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myCampaigns.map((c) => {
                const done = c.milestones.filter((m) => m.status === "approved").length
                const pct = c.milestones.length > 0 ? Math.round((done / c.milestones.length) * 100) : 0
                return (
                  <div key={c.id} className="rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-base-content">{c.name}</p>
                      <span className="text-xs text-base-content/60">{pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-base-300">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
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
