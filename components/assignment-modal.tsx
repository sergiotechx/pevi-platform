"use client"

import { useRef, useState, useEffect } from "react"
import { Users, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"

interface Campaign {
    campaign_id: number
    title: string
    status: string | null
}

interface AssignmentModalProps {
    beneficiaryId: number
    beneficiaryName: string
    onClose: () => void
}

export function AssignmentModal({ beneficiaryId, beneficiaryName, onClose }: AssignmentModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const { t } = useTranslation()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [assigning, setAssigning] = useState<number | null>(null)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        dialogRef.current?.showModal()

        // Fetch available campaigns
        fetch("/api/campaigns?include=basic")
            .then((r) => r.json())
            .then((data) => {
                // Only show active or draft campaigns
                setCampaigns(Array.isArray(data) ? data.filter((c: any) => c.status === "active" || c.status === "draft") : [])
            })
            .catch(() => setError("Failed to load campaigns"))
            .finally(() => setLoading(false))
    }, [])

    const handleClose = () => {
        dialogRef.current?.close()
        onClose()
    }

    const handleAssign = async (campaignId: number) => {
        setAssigning(campaignId)
        setError("")
        try {
            console.log("Assigning beneficiary:", { campaign_id: campaignId, user_id: beneficiaryId, status: "invited" })
            const res = await fetch("/api/campaign-beneficiaries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaign_id: campaignId,
                    user_id: beneficiaryId,
                    status: "invited",
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                if (data.error && data.error.includes("Unique constraint")) {
                    throw new Error(t("beneficiaries.alreadyEnrolled"))
                }
                throw new Error(data.error || "Failed to assign beneficiary")
            }

            setSuccess(true)

            // Trigger notification for the beneficiary
            try {
                await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: beneficiaryId,
                        title: "progress.invitation",
                        message: "progress.invitationMessage",
                        metadata: { campaign: campaigns.find(c => c.campaign_id === campaignId)?.title || "progress.newCampaign" },
                        type: "campaign",
                        actionUrl: "/dashboard/progress",
                        actionLabel: "progress.viewInvitation"
                    }),
                })
            } catch (notifyErr) {
                console.error("Failed to send notification:", notifyErr)
                // We don't throw here to avoid failing the whole assignment if notification fails
            }

            setTimeout(handleClose, 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setAssigning(null)
        }
    }

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box relative max-w-md bg-base-100 p-6 shadow-2xl overflow-hidden border border-base-300">
                <button
                    onClick={handleClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
                >
                    <X className="h-4 w-4" />
                </button>

                {success ? (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-base-content">{t("beneficiaries.assignSuccess")}</p>
                            <p className="text-sm text-base-content/60 mt-1">{beneficiaryName}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-heading text-lg font-bold text-base-content">
                                    {t("beneficiaries.selectCampaign")}
                                </h3>
                                <p className="text-xs text-base-content/60">{beneficiaryName}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-error/10 p-3 text-xs text-error font-medium">
                                {error}
                            </div>
                        )}

                        <div className="max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-none">
                            {loading ? (
                                <div className="py-10 text-center text-sm text-base-content/40">{t("common.loading")}</div>
                            ) : campaigns.length === 0 ? (
                                <div className="py-10 text-center text-sm text-base-content/40">No campaigns available</div>
                            ) : (
                                campaigns.map((c) => (
                                    <button
                                        key={c.campaign_id}
                                        disabled={assigning !== null}
                                        onClick={() => handleAssign(c.campaign_id)}
                                        className="flex w-full items-center justify-between rounded-xl border border-base-300 bg-base-200/30 p-4 font-medium text-base-content hover:bg-primary/10 hover:border-primary/50 transition-all text-left"
                                    >
                                        <span className="truncate">{c.title}</span>
                                        {assigning === c.campaign_id ? (
                                            <span className="loading loading-spinner loading-xs text-primary" />
                                        ) : (
                                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-base-300 text-base-content/50'}`}>
                                                {c.status}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="modal-action mt-6">
                            <Button variant="ghost" onClick={handleClose} disabled={!!assigning}>
                                {t("common.cancel")}
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        </dialog>
    )
}
