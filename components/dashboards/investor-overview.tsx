"use client"

import { Megaphone, DollarSign, Target, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { campaigns, payments } from "@/lib/mock-data"
import { useNotifications } from "@/lib/notification-context"

export function InvestorOverview() {
  const { unreadCount } = useNotifications()
  const totalBudget = campaigns.reduce((a, c) => a + c.budget, 0)
  const totalPaid = payments.reduce((a, p) => a + p.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Investor Dashboard</h1>
        <p className="text-sm text-base-content/60">Monitor campaigns and investment impact</p>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm text-base-content">You have <span className="font-semibold text-primary">{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</span>.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Campaigns" value={campaigns.length} icon={Megaphone} />
        <StatCard title="Total Budget" value={`${totalBudget.toLocaleString()} USDC`} icon={DollarSign} />
        <StatCard title="Total Disbursed" value={`${totalPaid.toLocaleString()} USDC`} icon={Target} />
      </div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">All Campaigns</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                <div>
                  <p className="text-sm font-medium text-base-content">{c.name}</p>
                  <p className="text-xs text-base-content/60">Budget: {c.budget.toLocaleString()} {c.currency}</p>
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
