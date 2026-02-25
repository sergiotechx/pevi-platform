"use client"

import Link from "next/link"
import useSWR from "swr"
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
  status: string | null
  campaign: CampaignWithProgress & { milestones?: { milestone_id: number }[] }
  activities?: ActivityForStats[]
}

export function BeneficiaryOverview() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()

  const { data: enrollmentsRaw, isLoading: loading } = useSWR<EnrollmentWithCampaign[]>(
    user?.id ? `/api/campaign-beneficiaries?user_id=${user.id}&include=full` : null,
    (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json()),
    { refreshInterval: 5000, revalidateOnFocus: true }
  )

  const enrollments = Array.isArray(enrollmentsRaw) ? enrollmentsRaw : []

  if (!user) return null

  const myCampaigns = enrollments
    .filter((e: EnrollmentWithCampaign) => e.status !== "invited")
    .map((e: EnrollmentWithCampaign) => e.campaign)
    .filter(Boolean)

  const allActivities = enrollments.flatMap((e: EnrollmentWithCampaign) => e.activities || [])
  const myEvidences = allActivities.filter((a: ActivityForStats) => a.evidence_ref).length
  const approvedMilestones = allActivities.filter(
    (a: ActivityForStats) => a.verification_status === "verified" || a.verification_status === "approved"
  ).length
  const pendingInvitations = enrollments.filter((e: EnrollmentWithCampaign) => e.status === "invited").length

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
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient">{t("benOverview.title")}</h1>
          <p className="mt-1 text-sm text-base-content/50">{t("benOverview.subtitle")}</p>
        </div>
        <Button asChild variant="outline"><Link href="/dashboard/explore"><Compass className="mr-2 h-4 w-4" />{t("benOverview.explore")}</Link></Button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-gradient-subtle p-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-base-content">{t("benOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("benOverview.myCampaigns")} value={loading ? "…" : myCampaigns.length} icon={Target} />
        <StatCard title={t("benOverview.evidenceSubmitted")} value={loading ? "…" : myEvidences} icon={Upload} />
        <StatCard title={t("benOverview.milestonesApproved")} value={loading ? "…" : approvedMilestones} icon={CheckCircle} />
        <StatCard title={t("benOverview.pendingInvitations")} value={pendingInvitations} icon={Bell} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("benOverview.myCampaigns")}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-base-content/50">{t("common.loading")}</p>
          ) : myCampaigns.length === 0 ? (
            <p className="text-sm text-base-content/50">{t("benOverview.noCampaigns")} <Link href="/dashboard/explore" className="text-primary hover:underline">{t("benOverview.exploreLink")}</Link>.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {campaignProgress.map(({ campaign_id, title, pct }: { campaign_id: number; title: string; pct: number }) => (
                <div key={campaign_id} className="rounded-xl border border-base-300/30 bg-base-300/20 p-4 transition-colors hover:bg-base-300/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-base-content">{title}</p>
                    <span className="text-xs font-semibold text-primary">{pct}%</span>
                  </div>
                  <div className="mt-2.5 h-2 rounded-full bg-base-300/50 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
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
