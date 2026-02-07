"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { campaigns } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

export default function ExplorePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const available = campaigns.filter((c) => c.status === "active" || c.status === "published")

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">Explore Campaigns</h1><p className="text-sm text-base-content/60">Discover campaigns you can join</p></div>
      <div className="flex flex-col gap-4">
        {available.length === 0 ? (
          <p className="text-sm text-base-content/60">No campaigns available at the moment.</p>
        ) : (
          available.map((c) => {
            const alreadyIn = user ? c.beneficiaries.includes(user.id) : false
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
                  <p className="mt-2 text-xs text-base-content/60">Budget: {c.budget.toLocaleString()} {c.currency} &middot; {c.milestones.length} milestones &middot; {c.startDate} to {c.endDate}</p>
                  <div className="mt-3">
                    {alreadyIn ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">Enrolled</span>
                    ) : (
                      <Button size="sm">Apply to Join</Button>
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
