"use client"

import React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

interface MilestoneRow {
    id?: number;
    title: string;
    description: string;
    reward: string
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id: campaignId } = use(params)
    const { t } = useTranslation()
    const { user } = useAuth()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [objectives, setObjectives] = useState("")
    const [budget, setBudget] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [milestones, setMilestones] = useState<MilestoneRow[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await fetch(`/api/campaigns/${campaignId}?include=full`)
                if (!res.ok) throw new Error("Failed to fetch campaign")
                const data = await res.json()

                setName(data.title || "")
                setDescription(data.description || "")
                // Objectives might not be in the direct model but in descriptions or metadata
                // For now using description if objectives is not found
                setObjectives(data.objectives || "")
                setBudget(data.cost?.toString() || "")

                if (data.start_at) {
                    setStartDate(new Date(data.start_at).toISOString().split('T')[0])
                }
                // End date mapping if available

                if (data.milestones) {
                    setMilestones(data.milestones.map((m: any) => ({
                        id: m.milestone_id,
                        title: m.name || "",
                        description: m.description || "",
                        reward: m.total_amount?.toString() || ""
                    })))
                } else {
                    setMilestones([{ title: "", description: "", reward: "" }])
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchCampaign()
    }, [campaignId, user])

    const addMilestone = () => setMilestones([...milestones, { title: "", description: "", reward: "" }])

    const removeMilestone = (i: number) => {
        const updated = milestones.filter((_, idx) => idx !== i)
        setMilestones(updated)
    }

    const updateMilestone = (i: number, field: keyof MilestoneRow, val: string) => {
        const updated = [...milestones]
        updated[i] = { ...updated[i], [field]: val }
        setMilestones(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!name || !description || !budget || !startDate) {
            setError(t("createCampaign.errorRequired"))
            return
        }

        setSubmitting(true)
        try {
            // 1. Update the campaign
            const campaignRes = await fetch(`/api/campaigns/${campaignId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: name,
                    description,
                    cost: parseFloat(budget),
                    start_at: new Date(startDate).toISOString(),
                }),
            })

            if (!campaignRes.ok) {
                const err = await campaignRes.json()
                throw new Error(err.error || "Failed to update campaign")
            }

            // 2. Handle milestones
            // Simple strategy for draft: delete existing and recreate
            // (This is okay as long as they are DRAFT and don't have relationships across tables)

            // Delete old milestones
            const oldMilestonesRes = await fetch(`/api/milestones?campaign_id=${campaignId}`)
            if (oldMilestonesRes.ok) {
                const oldMilestones = await oldMilestonesRes.json()
                for (const m of oldMilestones) {
                    if (m.campaign_id === parseInt(campaignId)) {
                        await fetch(`/api/milestones/${m.milestone_id}`, { method: "DELETE" })
                    }
                }
            }

            // Create new ones
            for (const m of milestones) {
                await fetch("/api/milestones", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        campaign_id: parseInt(campaignId),
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
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-10 text-center"><p className="text-base-content/60">{t("common.loading")}</p></div>

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Save className="h-8 w-8" />
                </div>
                <h2 className="font-heading text-xl font-bold text-base-content">{t("common.save")}...</h2>
                <p className="text-sm text-base-content/60">{t("createCampaign.redirecting")}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/campaigns" className="rounded-md p-1.5 text-base-content/60 hover:bg-base-300 hover:text-base-content">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight">{t("common.edit")} {t("common.campaign")}</h1>
                    <p className="text-sm text-base-content/60">{name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {error && <div className="rounded-md bg-error/10 p-3 text-sm text-error">{error}</div>}

                <Card className="border-base-300/50">
                    <CardHeader><CardTitle className="text-base">{t("createCampaign.details")}</CardTitle></CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>{t("createCampaign.name")}</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-base-100/50" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>{t("createCampaign.description")}</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-base-100/50" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label>{t("createCampaign.budgetLabel")}</Label>
                                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-base-100/50" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>{t("createCampaign.startDate")}</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-base-100/50" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-base-300/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">{t("createCampaign.milestones")}</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                            <Plus className="mr-1 h-4 w-4" />{t("createCampaign.add")}
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {milestones.map((m, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg border border-base-300/50 bg-base-300/20 p-3">
                                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                                    <Input
                                        value={m.title}
                                        onChange={(e) => updateMilestone(i, "title", e.target.value)}
                                        placeholder={t("createCampaign.milestoneTitle")}
                                        className="bg-base-100/50"
                                    />
                                    <Input
                                        value={m.description}
                                        onChange={(e) => updateMilestone(i, "description", e.target.value)}
                                        placeholder={t("createCampaign.milestoneDescription")}
                                        className="bg-base-100/50"
                                    />
                                    <Input
                                        type="number"
                                        value={m.reward}
                                        onChange={(e) => updateMilestone(i, "reward", e.target.value)}
                                        placeholder={t("createCampaign.milestoneReward")}
                                        className="w-32 bg-base-100/50"
                                    />
                                </div>
                                {milestones.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMilestone(i)}
                                        className="mt-2 text-base-content/60 hover:text-error"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" asChild><Link href="/dashboard/campaigns">{t("common.cancel")}</Link></Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? t("common.loading") : t("common.save")}
                    </Button>
                </div>
            </form>
        </div>
    )
}
