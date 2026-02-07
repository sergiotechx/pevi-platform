"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { campaigns } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

export default function ProgressPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  if (!user) return null
  const myCampaigns = campaigns.filter((c) => c.beneficiaries.includes(user.id))

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">My Progress</h1><p className="text-sm text-base-content/60">Track your milestones across campaigns</p></div>
      {myCampaigns.length === 0 ? (
        <p className="text-sm text-base-content/60">You are not enrolled in any campaigns yet.</p>
      ) : (
        myCampaigns.map((c) => (
          <Card key={c.id} className="border-base-300/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <StatusBadge status={c.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {c.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                    <div>
                      <p className="text-sm font-medium text-base-content">{m.title}</p>
                      <p className="text-xs text-base-content/60">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-base-content/60">{m.reward} USDC</span>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
