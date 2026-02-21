"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

interface MilestoneRow { title: string; description: string; reward: string }

export default function CreateCampaignPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [objectives, setObjectives] = useState("")
  const [budget, setBudget] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [milestones, setMilestones] = useState<MilestoneRow[]>([{ title: "", description: "", reward: "" }])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const addMilestone = () => setMilestones([...milestones, { title: "", description: "", reward: "" }])
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i))
  const updateMilestone = (i: number, field: keyof MilestoneRow, val: string) => {
    const updated = [...milestones]
    updated[i] = { ...updated[i], [field]: val }
    setMilestones(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name || !description || !budget || !startDate || !endDate) { setError(t("createCampaign.errorRequired")); return }
    if (milestones.some((m) => !m.title)) { setError(t("createCampaign.errorMilestoneTitle")); return }
    if (!user?.orgId) { setError("Organization not found. Your account must be linked to an organization to create campaigns."); return }

    setSubmitting(true)
    try {
      // 1. Create the campaign
      const campaignRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: user.orgId,
          title: name,
          description,
          cost: parseFloat(budget),
          start_at: new Date(startDate).toISOString(),
          status: "draft",
        }),
      })

      if (!campaignRes.ok) {
        const err = await campaignRes.json().catch(() => ({}))
        setError(err.error || "Failed to create campaign")
        setSubmitting(false)
        return
      }

      const campaign = await campaignRes.json()

      // 2. Create milestones for the campaign
      for (const m of milestones) {
        await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign_id: campaign.campaign_id,
            name: m.title,
            description: m.description || null,
            total_amount: m.reward ? parseFloat(m.reward) : null,
            currency: "USDC",
            status: "pending",
          }),
        })
      }

      setSuccess(true)
      setTimeout(() => router.push("/dashboard/campaigns"), 1500)
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="font-heading text-xl font-bold text-base-content">{t("createCampaign.success")}</h2>
        <p className="text-sm text-base-content/60">{t("createCampaign.redirecting")}</p>
      </div>
    )
  }

  // If user has no orgId, show notice
  if (user && user.role === "corporation" && !user.orgId) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns" className="rounded-md p-1.5 text-base-content/60 hover:bg-base-300 hover:text-base-content"><ArrowLeft className="h-5 w-5" /></Link>
          <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("createCampaign.title")}</h1></div>
        </div>
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 text-warning">
              <Plus className="h-6 w-6 rotate-45" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-bold text-base-content">Organization Not Linked</h3>
              <p className="text-sm text-base-content/60">
                Your account is not linked to any organization. An administrator must associate your account with an organization record before you can create campaigns.
              </p>
              <Button asChild variant="outline" className="mt-4"><Link href="/dashboard/campaigns">Go Back</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/campaigns" className="rounded-md p-1.5 text-base-content/60 hover:bg-base-300 hover:text-base-content"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("createCampaign.title")}</h1><p className="text-sm text-base-content/60">{t("createCampaign.subtitle")}</p></div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && <div className="rounded-md bg-error/10 p-3 text-sm text-error">{error}</div>}
        <Card className="border-base-300/50">
          <CardHeader><CardTitle className="text-base">{t("createCampaign.details")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2"><Label>{t("createCampaign.name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("createCampaign.namePlaceholder")} className="bg-base-100/50" /></div>
            <div className="flex flex-col gap-2"><Label>{t("createCampaign.description")}</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("createCampaign.descriptionPlaceholder")} className="bg-base-100/50" /></div>
            <div className="flex flex-col gap-2"><Label>{t("createCampaign.objectives")}</Label><Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder={t("createCampaign.objectivesPlaceholder")} className="bg-base-100/50" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2"><Label>{t("createCampaign.budgetLabel")}</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={t("createCampaign.budgetPlaceholder")} className="bg-base-100/50" /></div>
              <div className="flex flex-col gap-2"><Label>{t("createCampaign.startDate")}</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-base-100/50" /></div>
              <div className="flex flex-col gap-2"><Label>{t("createCampaign.endDate")}</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-base-100/50" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("createCampaign.milestones")}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMilestone}><Plus className="mr-1 h-4 w-4" />{t("createCampaign.add")}</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-base-300/50 bg-base-300/20 p-3">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <Input value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} placeholder={t("createCampaign.milestoneTitle")} className="bg-base-100/50" />
                  <Input value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} placeholder={t("createCampaign.milestoneDescription")} className="bg-base-100/50" />
                  <Input type="number" value={m.reward} onChange={(e) => updateMilestone(i, "reward", e.target.value)} placeholder={t("createCampaign.milestoneReward")} className="w-32 bg-base-100/50" />
                </div>
                {milestones.length > 1 && (
                  <button type="button" aria-label="Remove milestone" onClick={() => removeMilestone(i)} className="mt-2 text-base-content/60 hover:text-error"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild><Link href="/dashboard/campaigns">{t("common.cancel")}</Link></Button>
          <Button type="submit" disabled={submitting}>{submitting ? t("common.loading") : t("createCampaign.submit")}</Button>
        </div>
      </form>
    </div>
  )
}


