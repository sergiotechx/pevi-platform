"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { DonationModal } from "@/components/donation-modal"

type MilestoneItem = { milestone_id: number; status: string | null }
type BeneficiaryItem = { campaignBeneficiary_id: number }
type CampaignItem = {
  campaign_id: number
  title: string
  description: string | null
  cost: number | null
  status: string | null
  escrowId: string | null
  milestones?: MilestoneItem[]
  campaignBeneficiaries?: BeneficiaryItem[]
}

export default function CampaignsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canCreate = user?.role === "corporation"
  const canDonate = user?.role === "angel_investor"
  const [donatingCampaign, setDonatingCampaign] = useState<{ id: string; name: string; escrowId?: string } | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/campaigns?include=full`)
      .then((r) => r.json())
      .then((data: CampaignItem[]) => setCampaigns(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching campaigns:", err)
        setCampaigns([])
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (id: number, currentStatus: string | null) => {
    const newStatus = currentStatus === "draft" ? "active" : "draft"
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.campaign_id === id ? { ...c, status: newStatus } : c))
        )
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const visibleCampaigns = canCreate ? campaigns : campaigns.filter((c) => c.status !== "draft")

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-base-content/60">{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("campaigns.title")}</h1>
          <p className="text-sm text-base-content/60">{t("campaigns.subtitle")}</p>
        </div>
        {canCreate ? (
          <Button asChild>
            <Link href="/dashboard/campaigns/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("campaigns.new")}
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("campaigns.new")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {visibleCampaigns.map((c) => {
          const milestones = c.milestones ?? []
          const done = milestones.filter((m) => m.status === "approved").length
          const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0
          return (
            <Card key={c.campaign_id} className="border-base-300/50 overflow-hidden">
              <CardHeader className="pb-3 bg-base-300/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-bold">{c.title}</CardTitle>
                    <StatusBadge status={c.status ?? "draft"} />
                  </div>
                  {canCreate && c.status === "draft" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="font-bold border-base-300 text-base-content/70 hover:bg-base-300/50 hover:text-base-content transition-all"
                      >
                        <Link href={`/dashboard/campaigns/edit/${c.campaign_id}`}>
                          {t("common.edit")}
                        </Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-primary text-primary-content hover:bg-primary/90 shadow-md font-bold"
                        onClick={() => toggleStatus(c.campaign_id, c.status)}
                      >
                        {t("status.publish")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-content/60">{c.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-base-content/60">
                  <span>
                    {t("campaigns.budget", {
                      amount: (c.cost ?? 0).toLocaleString(),
                      currency: "USDC",
                    })}
                  </span>
                  <span>
                    {t("campaigns.beneficiaries", { count: c.campaignBeneficiaries?.length ?? 0 })}
                  </span>
                  <span>{t("campaigns.milestonesDone", { done, total: milestones.length })}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-base-300">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {canDonate && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                      onClick={() =>
                        setDonatingCampaign({
                          id: String(c.campaign_id),
                          name: c.title,
                          escrowId: c.escrowId || undefined
                        })
                      }
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {t("campaigns.donate")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {donatingCampaign && (
        <DonationModal
          campaignId={donatingCampaign.id}
          campaignName={donatingCampaign.name}
          escrowId={donatingCampaign.escrowId}
          onClose={() => setDonatingCampaign(null)}
        />
      )}
    </div>
  )
}
