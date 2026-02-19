"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

interface ActivityRow {
  activity_id: number
  activity_status: string | null
  evidence_status: string | null
  activity_observation: string | null
  evidence_ref: string | null
  evaluation_note: string | null
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

export default function EvaluationsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [activities, setActivities] = useState<ActivityRow[]>([])

  useEffect(() => {
    if (!user) return
    fetch(`/api/evaluator/evaluations?userId=${user.id}`)
      .then((res) => res.json())
      .then((data: ActivityRow[]) => setActivities(data))
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

  const campaignIds = Object.keys(grouped).map(Number)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("evaluations.title")}</h1>
        <p className="text-sm text-base-content/60">{t("evaluations.subtitle")}</p>
      </div>

      {campaignIds.length === 0 ? (
        <Card className="border-base-300/50">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-base-content/60">{t("evaluations.none")}</p>
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
                      {milestone.activities.map((a) => (
                        <div key={a.activity_id} className="flex flex-col gap-3 rounded-lg border border-base-300/50 bg-base-300/20 p-4">
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                            <span>
                              <span className="text-base-content/60">{t("review.beneficiary")} </span>
                              <span className="font-medium">{a.campaignBeneficiary.user.fullName}</span>
                            </span>
                          </div>

                          <div>
                            <p className="mb-1 text-xs text-base-content/60">{t("review.observation")}</p>
                            <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content">
                              {a.activity_observation ?? <span className="text-base-content/40">—</span>}
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 text-xs text-base-content/60">{t("review.evidenceUrl")}</p>
                            {a.evidence_ref
                              ? <a href={a.evidence_ref} target="_blank" rel="noopener noreferrer" className="rounded bg-base-100/50 px-3 py-2 text-sm text-primary hover:underline break-all block">{a.evidence_ref}</a>
                              : <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content/40">—</p>
                            }
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs text-base-content/60">{t("review.status")}</p>
                              <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content">{a.evidence_status ?? "—"}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-xs text-base-content/60">{t("evaluations.activityStatus")}</p>
                              <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content">{a.activity_status ?? "—"}</p>
                            </div>
                          </div>

                          <div>
                            <p className="mb-1 text-xs text-base-content/60">{t("review.evaluationNote")}</p>
                            <p className="rounded bg-base-100/50 px-3 py-2 text-sm text-base-content">
                              {a.evaluation_note ?? <span className="text-base-content/40">—</span>}
                            </p>
                          </div>
                        </div>
                      ))}
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
