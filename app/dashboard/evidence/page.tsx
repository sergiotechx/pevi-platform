"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { campaigns, evidences } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { Upload, FileText } from "lucide-react"

export default function EvidencePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [milestone, setMilestone] = useState("")
  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState(false)
  if (!user) return null

  const myCampaigns = campaigns.filter((c) => c.beneficiaries.includes(user.id))
  const submitMilestones = myCampaigns.flatMap((c) =>
    c.milestones.filter((m) => m.status === "pending" || m.status === "in_progress").map((m) => ({ ...m, campaignName: c.name }))
  )
  const myEvidence = evidences.filter((e) => e.beneficiaryId === user.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setMilestone(""); setDescription("") }, 2500)
  }

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
                <Select value={milestone} onValueChange={setMilestone}>
                  <SelectTrigger className="bg-base-100/50"><SelectValue placeholder={t("evidence.chooseMilestone")} /></SelectTrigger>
                  <SelectContent>
                    {submitMilestones.map((m) => <SelectItem key={m.id} value={m.id}>{m.title} ({m.campaignName})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2"><Label>{t("common.description")}</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("evidence.descriptionPlaceholder")} className="bg-base-100/50" /></div>
              <div className="flex flex-col gap-2">
                <Label>{t("evidence.fileUpload")}</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-base-300/50 bg-base-300/20 p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-base-content/40" />
                    <p className="text-sm text-base-content/60">{t("evidence.dragFiles")}</p>
                    <p className="text-xs text-base-content/50">{t("evidence.fileTypes")}</p>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={!milestone}>{t("evidence.submit")}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("evidence.submitted", { count: myEvidence.length })}</CardTitle></CardHeader>
        <CardContent>
          {myEvidence.length === 0 ? <p className="text-sm text-base-content/60">{t("evidence.none")}</p> : (
            <div className="flex flex-col gap-3">
              {myEvidence.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-base-content/60" />
                    <div><p className="text-sm font-medium text-base-content">{e.description}</p><p className="text-xs text-base-content/60">{t("evidence.submittedAt", { date: e.submittedAt })}</p></div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
