"use client"

import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { evaluations } from "@/lib/mock-data"
import { useTranslation } from "@/lib/i18n-context"

export default function VerifiedPage() {
  const { t } = useTranslation()
  const verified = evaluations.filter((ev) => ev.verificationStatus === "verified")

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">Audit History</h1><p className="text-sm text-base-content/60">Verified evaluations</p></div>
      {verified.length === 0 ? (
        <p className="text-sm text-base-content/60">No verified evaluations yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {verified.map((ev) => (
            <Card key={ev.id} className="border-base-300/50">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-base-content">Evaluation #{ev.id}</p>
                  <p className="text-xs text-base-content/60">{ev.comment}</p>
                  <p className="text-xs text-base-content/60 mt-1">{ev.evaluatedAt}</p>
                </div>
                <StatusBadge status={ev.verificationStatus} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
