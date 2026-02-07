"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { evaluations } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

export default function EvaluationsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  if (!user) return null
  const myEvals = evaluations.filter((ev) => ev.evaluatorId === user.id)

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("evaluations.title")}</h1><p className="text-sm text-base-content/60">{t("evaluations.subtitle")}</p></div>
      {myEvals.length === 0 ? (
        <p className="text-sm text-base-content/60">{t("evaluations.none")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {myEvals.map((ev) => (
            <Card key={ev.id} className="border-base-300/50">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-base-content">{t("evaluations.evidence", { id: ev.evidenceId })}</p>
                  <p className="text-xs text-base-content/60">{ev.comment}</p>
                  <p className="text-xs text-base-content/60 mt-1">{t("evaluations.evaluatedOn", { date: ev.evaluatedAt })}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={ev.decision} />
                  <StatusBadge status={ev.verificationStatus} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
