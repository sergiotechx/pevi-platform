"use client"

import { Megaphone, DollarSign, Target, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { campaigns, payments } from "@/lib/mock-data"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"

export function InvestorOverview() {
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const visibleCampaigns = campaigns.filter((c) => c.status !== "draft")
  const totalBudget = visibleCampaigns.reduce((a, c) => a + c.budget, 0)
  const totalPaid = payments.reduce((a, p) => a + p.amount, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-gradient">{t("invOverview.title")}</h1>
        <p className="mt-1 text-sm text-base-content/50">{t("invOverview.subtitle")}</p>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-gradient-subtle p-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-base-content">{t("invOverview.unread", { count: unreadCount })}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t("invOverview.totalCampaigns")} value={visibleCampaigns.length} icon={Megaphone} />
        <StatCard title={t("invOverview.totalBudget")} value={t("invOverview.budgetAmount", { amount: totalBudget.toLocaleString() })} icon={DollarSign} />
        <StatCard title={t("invOverview.totalDisbursed")} value={t("invOverview.budgetAmount", { amount: totalPaid.toLocaleString() })} icon={Target} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("invOverview.allCampaigns")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {visibleCampaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-base-300/30 bg-base-300/20 p-4 transition-colors hover:bg-base-300/40">
                <div>
                  <p className="text-sm font-semibold text-base-content">{c.name}</p>
                  <p className="text-xs text-base-content/50">{t("campaigns.budget", { amount: c.budget.toLocaleString(), currency: c.currency })}</p>
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
