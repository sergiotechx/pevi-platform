"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"

type MilestoneItem = { milestone_id: number; name: string | null; description: string | null; total_amount: number | null; currency: string | null; status: string | null }
type ActivityItem = { activity_id: number; milestone_id: number; evidence_status: string | null; verification_status: string | null }
type EnrollmentItem = {
  campaignBeneficiary_id: number
  status: string | null
  campaign: { campaign_id: number; org_id: number; title: string; status: string | null; milestones?: MilestoneItem[] }
  activities?: ActivityItem[]
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const fetchEnrollments = async () => {
    if (!user?.id) return
    try {
      const r = await fetch(`/api/campaign-beneficiaries?user_id=${user.id}&include=full`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      const data = await r.json()
      console.log("Fetched enrollments for progress:", data)
      setEnrollments(Array.isArray(data) ? data.filter((e: any) => e.status !== "rejected") : [])
    } catch (err) {
      console.error("Error fetching enrollments:", err)
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [user?.id])

  const notifyCorporation = async (id: number, accepted: boolean) => {
    try {
      const enrollment = enrollments.find(e => e.campaignBeneficiary_id === id)
      if (!enrollment || !enrollment.campaign?.org_id) return

      // Find organization staff for this org
      const staffRes = await fetch(`/api/organization-staff?org_id=${enrollment.campaign.org_id}`)
      if (!staffRes.ok) return
      const staffMembers = await staffRes.json()

      if (Array.isArray(staffMembers)) {
        for (const staff of staffMembers) {
          if (!staff.user_id) continue

          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: staff.user_id,
              title: accepted ? "progress.acceptedNotificationTitle" : "progress.declinedNotificationTitle",
              message: accepted ? "progress.acceptedNotificationMessage" : "progress.declinedNotificationMessage",
              metadata: { beneficiary: user?.name || "Un Beneficiario" },
              type: "campaign",
            }),
          })
        }
      }
    } catch (notifyErr) {
      console.error("Failed to notify corporation:", notifyErr)
    }
  }

  const handleAccept = async (id: number) => {
    setProcessingId(id)
    try {
      await fetch(`/api/campaign-beneficiaries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      })
      await notifyCorporation(id, true)
      await fetchEnrollments()
    } catch (err) {
      console.error("Error accepting invitation:", err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (id: number) => {
    setProcessingId(id)
    try {
      await fetch(`/api/campaign-beneficiaries/${id}`, {
        method: "DELETE",
      })
      await notifyCorporation(id, false)
      await fetchEnrollments()
    } catch (err) {
      console.error("Error declining invitation:", err)
    } finally {
      setProcessingId(null)
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("progress.title")}</h1><p className="text-sm text-base-content/60">{t("progress.subtitle")}</p></div>
      {loading ? (
        <p className="text-sm text-base-content/60">{t("common.loading")}</p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-base-content/60">{t("progress.none")}</p>
      ) : (
        enrollments.map((e) => {
          const c = e.campaign
          const isInvited = e.status === "invited"
          const milestones = c.milestones ?? []
          const activitiesByMilestone = new Map((e.activities ?? []).map((a) => [a.milestone_id, a]))
          return (
            <Card key={c.campaign_id} className="border-base-300/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <StatusBadge status={c.status ?? "draft"} />
                </div>
              </CardHeader>
              <CardContent>
                {e.status === "pending" ? (
                  <div className="flex flex-col gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center animate-in fade-in zoom-in duration-300">
                    <div>
                      <h3 className="font-bold text-amber-500">{t("public.applicationPending")}</h3>
                      <p className="text-xs text-base-content/60 mt-1">
                        {t("public.applicationPendingSubtitle")}
                      </p>
                    </div>
                  </div>
                ) : isInvited ? (
                  <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base-content">{t("progress.invitation")}</h3>
                      <p className="text-xs text-base-content/60 mt-1">
                        Esta organización desea que formes parte de su impacto.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-bold"
                        disabled={processingId !== null}
                        onClick={() => handleDecline(e.campaignBeneficiary_id)}
                      >
                        {t("progress.decline")}
                      </Button>
                      <Button
                        size="sm"
                        className="font-bold shadow-md"
                        disabled={processingId !== null}
                        onClick={() => handleAccept(e.campaignBeneficiary_id)}
                      >
                        {processingId === e.campaignBeneficiary_id ? <span className="loading loading-spinner loading-xs" /> : t("progress.accept")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {milestones.map((m) => {
                      const activity = activitiesByMilestone.get(m.milestone_id)
                      const status = activity?.verification_status ?? activity?.evidence_status ?? m.status ?? "pending"
                      const amount = m.total_amount ?? 0
                      const currency = m.currency ?? "USDC"
                      return (
                        <div key={m.milestone_id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                          <div>
                            <p className="text-sm font-medium text-base-content">{m.name ?? ""}</p>
                            <p className="text-xs text-base-content/60">{m.description ?? ""}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-base-content/60">{t("progress.reward", { amount })}</span>
                            <StatusBadge status={status} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
