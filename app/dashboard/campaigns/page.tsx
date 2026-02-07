"use client"

import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { campaigns } from "@/lib/mock-data"
import { useTranslation } from "@/lib/i18n-context"

export default function CampaignsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("campaigns.title")}</h1>
          <p className="text-sm text-base-content/60">{t("campaigns.subtitle")}</p>
        </div>
        <Button asChild><Link href="/dashboard/campaigns/create"><PlusCircle className="mr-2 h-4 w-4" />{t("campaigns.new")}</Link></Button>
      </div>
      <div className="flex flex-col gap-4">
        {campaigns.map((c) => {
          const done = c.milestones.filter((m) => m.status === "approved").length
          const pct = c.milestones.length ? Math.round((done / c.milestones.length) * 100) : 0
          return (
            <Card key={c.id} className="border-base-300/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <StatusBadge status={c.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-content/60">{c.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-base-content/60">
                  <span>{t("campaigns.budget", { amount: c.budget.toLocaleString(), currency: c.currency })}</span>
                  <span>{t("campaigns.beneficiaries", { count: c.beneficiaries.length })}</span>
                  <span>{t("campaigns.milestonesDone", { done, total: c.milestones.length })}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-base-300">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
