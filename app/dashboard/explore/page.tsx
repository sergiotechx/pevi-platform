"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { api } from "@/lib/api-client"

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
  const [enrolledCampaignIds, setEnrolledCampaignIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<number | null>(null)

  useEffect(() => {
    api.campaigns.getAll({ include: "basic" }).then((data: CampaignItem[]) => {
      setCampaigns(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/campaign-beneficiaries?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data: { campaign_id: number }[]) => {
        const ids = new Set((Array.isArray(data) ? data : []).map((e) => e.campaign_id))
        setEnrolledCampaignIds(ids)
      })
      .catch(() => {})
  }, [user?.id])

  const available = campaigns.filter((c) => c.status === "active" || c.status === "published")

  const handleEnroll = async (campaignId: number) => {
    if (!user?.id) return
    setEnrollingId(campaignId)
    try {
      await api.campaignBeneficiaries.create({
        campaign_id: campaignId,
        user_id: parseInt(String(user.id), 10),
        status: "active",
      })
      setEnrolledCampaignIds((prev) => new Set(prev).add(campaignId))
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
            const alreadyIn = enrolledCampaignIds.has(c.campaign_id)
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
                    {c.start_at && ` · ${c.start_at}`}
                  </p>
                  <div className="mt-3">
                    {alreadyIn ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">{t("explore.enrolled")}</span>
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
