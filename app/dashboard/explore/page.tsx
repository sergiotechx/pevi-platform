"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { api } from "@/lib/api-client"
import { formatDate } from "@/lib/date-utils"

type CampaignItem = {
  campaign_id: number
  title: string
  description: string | null
  cost: number | null
  start_at: string | null
  status: string | null
  milestones?: { milestone_id: number }[]
}

export default function ExplorePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<number | null>(null)

  useEffect(() => {
    api.campaigns.getAll({ include: "basic" }).then((data) => {
      const campaignsData = data as CampaignItem[]
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/campaign-beneficiaries?user_id=${user.id}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      .then((r) => r.json())
      .then((data: { campaign_id: number; status: string }[]) => {
        const statusesMap = new Map<number, string>()
        if (Array.isArray(data)) {
          data.forEach(e => statusesMap.set(e.campaign_id, e.status))
        }
        setEnrollmentStatuses(statusesMap)
      })
      .catch(() => { })
  }, [user?.id])

  const available = campaigns.filter((c) => {
    const isAvailableStatus = c.status === "active" || c.status === "published"
    const isRejected = enrollmentStatuses.get(c.campaign_id) === 'rejected'
    return isAvailableStatus && !isRejected
  })

  const handleEnroll = async (campaignId: number) => {
    if (!user?.id) return
    setEnrollingId(campaignId)
    try {
      await api.campaignBeneficiaries.create({
        campaign_id: campaignId,
        user_id: parseInt(String(user.id), 10),
        status: "pending",
      })
      setEnrollmentStatuses((prev) => {
        const nMap = new Map(prev)
        nMap.set(campaignId, 'pending')
        return nMap
      })
    } catch {
      // leave as not enrolled
    } finally {
      setEnrollingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("explore.title")}</h1><p className="text-sm text-base-content/60">{t("explore.subtitle")}</p></div>
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-base-content/60">{t("common.loading")}</p>
        ) : available.length === 0 ? (
          <p className="text-sm text-base-content/60">{t("explore.none")}</p>
        ) : (
          available.map((c) => {
            const status = enrollmentStatuses.get(c.campaign_id)
            const isPending = status === 'pending'
            const isEnrolled = status === 'active'
            const enrolling = enrollingId === c.campaign_id
            return (
              <Card key={c.campaign_id} className="border-base-300/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{c.title}</CardTitle>
                    <StatusBadge status={c.status ?? "draft"} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-base-content/60">{c.description ?? ""}</p>
                  <p className="mt-2 text-xs text-base-content/60">
                    {c.cost != null && t("explore.budget", { amount: c.cost.toLocaleString(), currency: "USDC" })}
                    {" · "}{t("explore.milestones", { count: c.milestones?.length ?? 0 })}
                    {c.start_at && ` · ${formatDate(c.start_at)}`}
                  </p>
                  <div className="mt-3">
                    {isEnrolled ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">{t("explore.enrolled")}</span>
                    ) : isPending ? (
                      <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">{t("explore.pending")}</span>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" disabled={enrolling} onClick={() => handleEnroll(c.campaign_id)}>
                          {enrolling ? t("common.loading") : t("explore.apply")}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
