"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { Upload, FileText } from "lucide-react"
import { api } from "@/lib/api-client"

type MilestoneItem = { milestone_id: number; name: string | null }
type ActivityItem = { activity_id: number; milestone_id: number; evidence_ref: string | null; activity_observation: string | null; evidence_status: string | null }
type EnrollmentItem = {
  campaignBeneficiary_id: number
  campaign: { campaign_id: number; title: string; milestones?: MilestoneItem[] }
  activities?: ActivityItem[]
}

type Slot = { key: string; campaignTitle: string; milestoneName: string; milestoneId: number; campaignBeneficiaryId: number; activityId?: number }

export default function EvidencePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState("")
  const [link, setLink] = useState("")
  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/campaign-beneficiaries?user_id=${user.id}&include=full`)
      .then((r) => r.json())
      .then((data: EnrollmentItem[]) => setEnrollments(Array.isArray(data) ? data : []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  const slots: Slot[] = enrollments.flatMap((e) =>
    (e.campaign.milestones ?? []).map((m) => {
      const activity = e.activities?.find((a) => a.milestone_id === m.milestone_id)
      return {
        key: `${e.campaignBeneficiary_id}-${m.milestone_id}`,
        campaignTitle: e.campaign.title,
        milestoneName: m.name ?? "",
        milestoneId: m.milestone_id,
        campaignBeneficiaryId: e.campaignBeneficiary_id,
        activityId: activity?.activity_id,
      }
    })
  )

  const submittedActivities = enrollments.flatMap((e) => (e.activities ?? []).filter((a) => a.evidence_ref || a.activity_observation))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slot = slots.find((s) => s.key === selectedSlot)
    if (!slot || !user?.id) return
    setSubmitting(true)
    try {
      if (slot.activityId) {
        await api.activities.update(slot.activityId, {
          evidence_ref: link || undefined,
          activity_observation: description || undefined,
          evidence_status: "submitted",
        })
      } else {
        await api.activities.create({
          milestone_id: slot.milestoneId,
          campaignBeneficiary_id: slot.campaignBeneficiaryId,
          evidence_ref: link || undefined,
          activity_observation: description || undefined,
          evidence_status: "submitted",
        })
      }
      setSuccess(true)
      setSelectedSlot("")
      setLink("")
      setDescription("")
      fetch(`/api/campaign-beneficiaries?user_id=${user.id}&include=full`)
        .then((r) => r.json())
        .then((data: EnrollmentItem[]) => setEnrollments(Array.isArray(data) ? data : []))
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      // error
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("evidence.title")}</h1><p className="text-sm text-base-content/60">{t("evidence.subtitle")}</p></div>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("evidence.submitNew")}</CardTitle></CardHeader>
        <CardContent>
          {success ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"><Upload className="h-4 w-4" /></div>
              <p className="text-sm text-emerald-400">{t("evidence.success")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t("evidence.selectMilestone")}</Label>
                <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={loading}>
                  <SelectTrigger className="bg-base-100/50"><SelectValue placeholder={t("evidence.chooseMilestone")} /></SelectTrigger>
                  <SelectContent>
                    {slots.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.milestoneName} ({s.campaignTitle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("evidence.fileUpload")} / URL</Label>
                <Textarea value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://... o descripción del enlace" className="bg-base-100/50" rows={1} />
              </div>
              <div className="flex flex-col gap-2"><Label>{t("common.description")}</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("evidence.descriptionPlaceholder")} className="bg-base-100/50" /></div>
              <Button type="submit" disabled={!selectedSlot || submitting}>{submitting ? t("common.loading") : t("evidence.submit")}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("evidence.submitted", { count: submittedActivities.length })}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-base-content/60">{t("common.loading")}</p>
          ) : submittedActivities.length === 0 ? (
            <p className="text-sm text-base-content/60">{t("evidence.none")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {submittedActivities.map((a) => (
                <div key={a.activity_id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-base-content/60" />
                    <div>
                      <p className="text-sm font-medium text-base-content">{a.activity_observation || a.evidence_ref || "—"}</p>
                      {a.evidence_ref && <p className="text-xs text-base-content/60">{a.evidence_ref}</p>}
                    </div>
                  </div>
                  <StatusBadge status={a.evidence_status ?? "pending"} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
