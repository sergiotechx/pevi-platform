"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { signAndSubmitTransaction } from "@/lib/stellar"

interface ActivityRow {
  activity_id: number
  activity_status: string | null
  evidence_status: string | null
  activity_observation: string | null
  evidence_ref: string | null
  evaluation_note: string | null
  verification_note: string | null
  milestone: {
    milestone_id: number
    name: string | null
    campaign: {
      campaign_id: number
      title: string
    }
  }
  campaignBeneficiary: {
    user: {
      fullName: string
    }
  }
}

interface FormState {
  evidence_status: string
  evaluation_note: string
  saving: boolean
  saved: boolean
}

interface GroupedData {
  [campaignId: number]: {
    title: string
    milestones: {
      [milestoneId: number]: {
        name: string | null
        activities: ActivityRow[]
      }
    }
  }
}

export default function ReviewPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [form, setForm] = useState<Record<number, FormState>>({})

  useEffect(() => {
    if (!user) return
    fetch(`/api/evaluator/review?userId=${user.id}`)
      .then((res) => res.json())
      .then((data: ActivityRow[]) => {
        setActivities(data)
        const initial: Record<number, FormState> = {}
        data.forEach((a) => {
          initial[a.activity_id] = {
            evidence_status: a.evidence_status ?? "pending",
            evaluation_note: a.evaluation_note ?? "",
            saving: false,
            saved: false,
          }
        })
        setForm(initial)
      })
  }, [user])

  if (!user) return null

  const grouped = activities.reduce<GroupedData>((acc, a) => {
    const cid = a.milestone.campaign.campaign_id
    const mid = a.milestone.milestone_id
    if (!acc[cid]) acc[cid] = { title: a.milestone.campaign.title, milestones: {} }
    if (!acc[cid].milestones[mid]) acc[cid].milestones[mid] = { name: a.milestone.name, activities: [] }
    acc[cid].milestones[mid].activities.push(a)
    return acc
  }, {})

  const handleSave = async (activityId: number) => {
    setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: true, saved: false } }))
    const es = form[activityId].evidence_status
    const original = activities.find((a) => a.activity_id === activityId)

    if (es === "approved") {
      if (!user?.walletAddress) {
        console.error("No wallet connected")
        alert("Debes conectar tu billetera para aprobar hitos.")
        setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: false, saved: false } }))
        return
      }

      try {
        const proofRes = await fetch("/api/evaluator/proof", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_id: activityId,
            evaluator_address: user.walletAddress
          })
        })
        const proofData = await proofRes.json()

        if (proofData.xdr) {
          const txRes = await signAndSubmitTransaction(proofData.xdr)

          if (txRes.error) {
            console.error("Signature failed:", txRes.error)
            alert(`Error al firmar: ${txRes.error}`)
            setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: false, saved: false } }))
            return
          }
        } else {
          console.error("No XDR returned:", proofData)
          alert("Error al generar transacción de prueba.")
          setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: false, saved: false } }))
          return
        }
      } catch (err) {
        console.error("Failed to generate/sign proof:", err)
        alert("Fallo al firmar la aprobación on-chain.")
        setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: false, saved: false } }))
        return
      }
    }

    const body: Record<string, string> = {
      evidence_status: es,
      evaluation_note: form[activityId].evaluation_note,
      approver_public_key: user?.walletAddress || "",
    }
    if (es === "approved" || es === "rejected") {
      body.activity_status = es
    }
    if (original && es !== (original.evidence_status ?? "pending")) {
      body.verification_status = "pending"
    }
    await fetch(`/api/activities/${activityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    // If the activity was approved, remove it from the pending view immediately
    if (es === "approved") {
      setActivities((prev) => prev.filter(a => a.activity_id !== activityId))
    } else {
      setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: false, saved: true } }))
    }
  }

  const campaignIds = Object.keys(grouped).map(Number)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("review.title")}</h1>
        <p className="text-sm text-base-content/60">{t("review.subtitle")}</p>
      </div>

      {campaignIds.length === 0 ? (
        <Card className="border-base-300/50">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-base-content/60">{t("review.noPending")}</p>
          </CardContent>
        </Card>
      ) : (
        campaignIds.map((cid) => {
          const campaign = grouped[cid]
          const milestoneIds = Object.keys(campaign.milestones).map(Number)
          return (
            <div key={cid} className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-base-content">{campaign.title}</h2>

              {milestoneIds.map((mid) => {
                const milestone = campaign.milestones[mid]
                return (
                  <Card key={mid} className="border-base-300/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-base-content/80"><span className="text-base-content/50">Milestone: </span>{milestone.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {milestone.activities.map((a) => {
                        const f = form[a.activity_id]
                        if (!f) return null
                        return (
                          <div key={a.activity_id} className="flex flex-col gap-3 rounded-lg border border-base-300/50 bg-base-300/20 p-4">
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                              <span>
                                <span className="text-base-content/60">{t("review.beneficiary")}: </span>
                                <span className="font-medium">{a.campaignBeneficiary.user.fullName}</span>
                              </span>
                            </div>

                            {a.activity_observation && (
                              <div>
                                <p className="mb-1 text-xs text-base-content/60">{t("review.observation")}</p>
                                <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content">{a.activity_observation}</p>
                              </div>
                            )}

                            <div>
                              <p className="mb-1 text-xs text-base-content/60">{t("review.evidenceUrl")}</p>
                              {a.evidence_ref
                                ? <a href={a.evidence_ref} target="_blank" rel="noopener noreferrer" className="rounded bg-base-100/50 px-3 py-2 text-sm text-primary hover:underline break-all block">{a.evidence_ref}</a>
                                : <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content/40">—</p>
                              }
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs text-base-content/60">{t("review.status")}</label>
                                <select
                                  value={f.evidence_status}
                                  onChange={(e) => setForm((prev) => ({ ...prev, [a.activity_id]: { ...prev[a.activity_id], evidence_status: e.target.value, saved: false } }))}
                                  className="select select-bordered select-sm w-full bg-base-100/50"
                                >
                                  <option value="submitted">{t("review.statusSubmitted")}</option>
                                  <option value="pending">{t("review.statusPending")}</option>
                                  <option value="review">{t("review.statusReview")}</option>
                                  <option value="approved">{t("review.statusApproved")}</option>
                                  <option value="rejected">{t("review.statusRejected")}</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs text-base-content/60">{t("review.evaluationNote")}</label>
                              <Textarea
                                value={f.evaluation_note}
                                onChange={(e) => setForm((prev) => ({ ...prev, [a.activity_id]: { ...prev[a.activity_id], evaluation_note: e.target.value, saved: false } }))}
                                placeholder={t("review.feedbackPlaceholder")}
                                className="bg-base-100/50"
                                rows={3}
                              />
                            </div>

                            {a.verification_note && (
                              <div>
                                <label className="mb-1 block text-xs text-base-content/60">{t("review.verificationNote")}</label>
                                <Textarea
                                  value={a.verification_note}
                                  readOnly
                                  className="bg-base-100/50 opacity-70 cursor-not-allowed"
                                  rows={3}
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <Button size="sm" onClick={() => handleSave(a.activity_id)} disabled={f.saving}>
                                {f.saving ? t("review.saving") : t("review.save")}
                              </Button>
                              {f.saved && <span className="text-xs text-emerald-400">{t("review.saved")}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
