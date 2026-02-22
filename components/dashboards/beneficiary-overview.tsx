"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Target, Upload, CheckCircle, Bell, Compass } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

type CampaignWithProgress = {
  campaign_id: number
  title: string
  status: string | null
  milestones?: { milestone_id: number }[]
}

type ActivityForStats = { activity_id: number; evidence_ref: string | null; verification_status: string | null }

type EnrollmentWithCampaign = {
  campaignBeneficiary_id: number
  campaign: CampaignWithProgress & { milestones?: { milestone_id: number }[] }
  activities?: ActivityForStats[]
}

export function BeneficiaryOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const [enrollments, setEnrollments] = useState<EnrollmentWithCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/campaign-beneficiaries?user_id=${user.id}&include=full`)
      .then((r) => r.json())
      .then((data: EnrollmentWithCampaign[]) => setEnrollments(Array.isArray(data) ? data : []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (!user) return null

  const myCampaigns = enrollments.map((e: EnrollmentWithCampaign) => e.campaign).filter(Boolean)
  const allActivities = enrollments.flatMap((e: EnrollmentWithCampaign) => e.activities || [])
  const myEvidences = allActivities.filter((a: ActivityForStats) => a.evidence_ref).length
  const approvedMilestones = allActivities.filter(
    (a: ActivityForStats) => a.verification_status === "verified" || a.verification_status === "approved"
  ).length
  const pendingInvitations = 0

  // Progress per campaign: from enrollments we have campaign + activities (per enrollment)
  const campaignProgress = myCampaigns.map((c: CampaignWithProgress) => {
    const enrollment = enrollments.find((e: EnrollmentWithCampaign) => e.campaign?.campaign_id === c.campaign_id)
    const activities = enrollment?.activities || []
    const total = c.milestones?.length ?? 0
    const done = activities.filter(
      (a: { verification_status: string | null }) => a.verification_status === "verified" || a.verification_status === "approved"
    ).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return { campaign_id: c.campaign_id, title: c.title, total, done, pct }
  })

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
        <StatCard title={t("benOverview.myCampaigns")} value={loading ? "…" : myCampaigns.length} icon={Target} />
        <StatCard title={t("benOverview.evidenceSubmitted")} value={loading ? "…" : myEvidences} icon={Upload} />
        <StatCard title={t("benOverview.milestonesApproved")} value={loading ? "…" : approvedMilestones} icon={CheckCircle} />
        <StatCard title={t("benOverview.pendingInvitations")} value={pendingInvitations} icon={Bell} />
      </div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("benOverview.myCampaigns")}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-base-content/60">{t("common.loading")}</p>
          ) : myCampaigns.length === 0 ? (
            <p className="text-sm text-base-content/60">{t("benOverview.noCampaigns")} <Link href="/dashboard/explore" className="text-primary hover:underline">{t("benOverview.exploreLink")}</Link>.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {campaignProgress.map(({ campaign_id, title, pct }: { campaign_id: number; title: string; pct: number }) => (
                <div key={campaign_id} className="rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-base-content">{title}</p>
                    <span className="text-xs text-base-content/60">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-base-300">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
