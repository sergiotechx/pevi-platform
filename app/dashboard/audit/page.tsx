"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

interface ActivityRow {
  activity_id: number
  activity_status: string | null
  evidence_status: string | null
  verification_status: string | null
  verification_note: string | null
  activity_observation: string | null
  evidence_ref: string | null
  evaluation_note: string | null
  evaluator_name: string | null
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
  verification_status: string
  verification_note: string
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

export default function AuditPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [form, setForm] = useState<Record<number, FormState>>({})

  useEffect(() => {
    if (!user) return
    fetch(`/api/verifier/audit?userId=${user.id}`)
      .then((res) => res.json())
      .then((data: ActivityRow[]) => {
        setActivities(data)
        const initial: Record<number, FormState> = {}
        data.forEach((a) => {
          initial[a.activity_id] = {
            verification_status: a.verification_status ?? "pending",
            verification_note: a.verification_note ?? "",
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
    const vs = form[activityId].verification_status
    const body: Record<string, string> = {
      verification_status: vs,
      verification_note: form[activityId].verification_note,
    }
    if (vs === "review" || vs === "rejected") {
      body.activity_status = "review"
    }
    await fetch(`/api/activities/${activityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setForm((prev) => ({ ...prev, [activityId]: { ...prev[activityId], saving: false, saved: true } }))
  }

  const campaignIds = Object.keys(grouped).map(Number)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("audit.title")}</h1>
        <p className="text-sm text-base-content/60">{t("audit.subtitle")}</p>
      </div>

      {campaignIds.length === 0 ? (
        <Card className="border-base-300/50">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-base-content/60">{t("audit.noPending")}</p>
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
                      <CardTitle className="text-sm font-medium text-base-content/80">
                        <span className="text-base-content/50">Milestone: </span>{milestone.name}
                      </CardTitle>
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

                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                              <span>
                                <span className="text-base-content/60">{t("audit.evaluator")} </span>
                                <span className="font-medium">{a.evaluator_name ?? "—"}</span>
                              </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs text-base-content/60">{t("audit.evaluationStatus")}</label>
                                <select
                                  value={a.evidence_status ?? "pending"}
                                  disabled
                                  className="select select-bordered select-sm w-full bg-base-100/50 opacity-70 cursor-not-allowed"
                                >
                                  <option value="pending">{t("review.statusPending")}</option>
                                  <option value="review">{t("review.statusReview")}</option>
                                  <option value="approved">{t("review.statusApproved")}</option>
                                  <option value="rejected">{t("review.statusRejected")}</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs text-base-content/60">{t("audit.evaluatorNote")}</label>
                              <Textarea
                                value={a.evaluation_note ?? ""}
                                readOnly
                                className="bg-base-100/50 opacity-70 cursor-not-allowed"
                                rows={3}
                              />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs text-base-content/60">{t("audit.verificationStatus")}</label>
                                <select
                                  value={f.verification_status}
                                  onChange={(e) => setForm((prev) => ({ ...prev, [a.activity_id]: { ...prev[a.activity_id], verification_status: e.target.value, saved: false } }))}
                                  className="select select-bordered select-sm w-full bg-base-100/50"
                                >
                                  <option value="pending">{t("audit.statusPending")}</option>
                                  <option value="review">{t("audit.statusReview")}</option>
                                  <option value="approved">{t("audit.statusApproved")}</option>
                                  <option value="rejected">{t("audit.statusRejected")}</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs text-base-content/60">{t("audit.verificationNote")}</label>
                              <Textarea
                                value={f.verification_note}
                                onChange={(e) => setForm((prev) => ({ ...prev, [a.activity_id]: { ...prev[a.activity_id], verification_note: e.target.value, saved: false } }))}
                                placeholder={t("audit.notePlaceholder")}
                                className="bg-base-100/50"
                                rows={3}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <Button size="sm" onClick={() => handleSave(a.activity_id)} disabled={f.saving}>
                                {f.saving ? t("audit.saving") : t("audit.save")}
                              </Button>
                              {f.saved && <span className="text-xs text-emerald-400">{t("audit.saved")}</span>}
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
