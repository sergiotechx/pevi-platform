"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { campaigns, evidences, users } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { CheckCircle, XCircle } from "lucide-react"

export default function ReviewPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({})
  if (!user) return null

  const assignedCampaigns = campaigns.filter((c) => c.evaluatorId === user.id)
  const pendingEvidence = evidences.filter((e) => {
    const c = assignedCampaigns.find((ca) => ca.id === e.campaignId)
    return c && e.status === "pending"
  })

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    setDecided((prev) => ({ ...prev, [id]: decision }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("review.title")}</h1><p className="text-sm text-base-content/60">{t("review.subtitle")}</p></div>
      {pendingEvidence.length === 0 ? (
        <Card className="border-base-300/50"><CardContent className="py-12 text-center"><p className="text-sm text-base-content/60">{t("review.noPending")}</p></CardContent></Card>
      ) : (
        pendingEvidence.map((e) => {
          const c = campaigns.find((ca) => ca.id === e.campaignId)
          const m = c?.milestones.find((mi) => mi.id === e.milestoneId)
          const beneficiary = users.find((u) => u.id === e.beneficiaryId)
          const isDecided = !!decided[e.id]
          return (
            <Card key={e.id} className="border-base-300/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{m?.title || t("review.evidence")}</CardTitle>
                  {isDecided ? <StatusBadge status={decided[e.id]} /> : <StatusBadge status="pending" />}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div><span className="text-base-content/60">{t("review.campaign")}</span> <span className="text-base-content">{c?.name}</span></div>
                  <div><span className="text-base-content/60">{t("review.beneficiary")}</span> <span className="text-base-content">{beneficiary?.name}</span></div>
                  <div><span className="text-base-content/60">{t("review.submitted")}</span> <span className="text-base-content">{e.submittedAt}</span></div>
                  <div><span className="text-base-content/60">{t("review.reward")}</span> <span className="text-base-content">{m?.reward} USDC</span></div>
                </div>
                <p className="text-sm text-base-content/60">{e.description}</p>
                {!isDecided && (
                  <>
                    <Textarea placeholder={t("review.feedbackPlaceholder")} value={feedback[e.id] || ""} onChange={(ev) => setFeedback((p) => ({ ...p, [e.id]: ev.target.value }))} className="bg-base-100/50" />
                    <div className="flex gap-3">
                      <Button onClick={() => handleDecision(e.id, "approved")} className="bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle className="mr-2 h-4 w-4" />{t("review.approve")}</Button>
                      <Button variant="outline" onClick={() => handleDecision(e.id, "rejected")} className="text-error hover:text-error"><XCircle className="mr-2 h-4 w-4" />{t("review.reject")}</Button>
                    </div>
                  </>
                )}
                {isDecided && <p className="text-sm text-emerald-400">{t("review.decisionRecorded", { decision: decided[e.id] })}</p>}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
