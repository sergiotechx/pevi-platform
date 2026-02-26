"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Heart, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { DonationModal } from "@/components/donation-modal"
import { toast } from "sonner"

type MilestoneItem = { milestone_id: number; status: string | null }
type BeneficiaryItem = { campaignBeneficiary_id: number }
type CampaignItem = {
  campaign_id: number
  title: string
  description: string | null
  cost: number | null
  status: string | null
  escrowId: string | null
  milestones?: MilestoneItem[]
  campaignBeneficiaries?: BeneficiaryItem[]
  donations?: { amount: number | string }[]
}

export default function CampaignsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canCreate = user?.role === "corporation"
  const canDonate = user?.role === "angel_investor"
  const [donatingCampaign, setDonatingCampaign] = useState<{ id: string; name: string; escrowId?: string } | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/campaigns?include=full`)
      .then((r) => r.json())
      .then((data: CampaignItem[]) => setCampaigns(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching campaigns:", err)
        setCampaigns([])
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (id: number, currentStatus: string | null) => {
    const newStatus = currentStatus === "draft" ? "active" : "draft"
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.campaign_id === id ? { ...c, status: newStatus } : c))
        )
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleReleaseFunds = async (campaignId: number, escrowId: string) => {
    if (!user?.walletAddress) {
      toast.error("Debes conectar tu billetera de Corporation para liberar fondos.")
      return
    }
    setReleasing(campaignId)

    const signStep = async (stepName: string, label: string): Promise<string | null> => {
      const { signTransaction } = await import("@stellar/freighter-api")
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrow_id: escrowId, approver_public_key: user!.walletAddress, step: stepName })
      })
      const data = await res.json()
      if (!data.unsignedXdr) {
        toast.error(`Error de liberación (${label}): ` + (data.error || "Sin XDR"))
        return null
      }

      const networkPassphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015"

      const signed = await signTransaction(data.unsignedXdr, { networkPassphrase })
      if (signed.error) {
        const isCancelled =
          (typeof signed.error === "object" && Object.keys(signed.error as object).length === 0) ||
          (typeof signed.error === "string" && /reject|cancel|decline/i.test(signed.error))
        toast.error(isCancelled ? "Transacción cancelada." : `Error firmando (${label}): ${signed.error}`)
        return null
      }
      return signed.signedTxXdr
    }

    try {
      // Step 1: change-milestone-status
      const signedChange = await signStep("change_status", "cambio de estado")
      if (!signedChange) return

      const submitChange = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrow_id: escrowId, approver_public_key: user.walletAddress, step: "submit_change", signed_xdr: signedChange })
      })
      const submitChangeData = await submitChange.json()
      if (!submitChangeData.ok && submitChangeData.error) {
        toast.error("Error enviando estado: " + submitChangeData.error)
        return
      }

      // Step 2: approve-milestone (skip if already approved from a prior attempt)
      const approveRes = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrow_id: escrowId, approver_public_key: user.walletAddress, step: "approve" })
      })
      const approveData = await approveRes.json()

      if (!approveData.alreadyApproved) {
        if (!approveData.unsignedXdr) {
          toast.error("Error de liberación (aprobación): " + (approveData.error || "Sin XDR"))
          return
        }
        const { signTransaction } = await import("@stellar/freighter-api")
        const networkPassphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        const signedApprove = await signTransaction(approveData.unsignedXdr, { networkPassphrase })
        if (signedApprove.error) {
          const isCancelled =
            (typeof signedApprove.error === "object" && Object.keys(signedApprove.error as object).length === 0) ||
            (typeof signedApprove.error === "string" && /reject|cancel|decline/i.test(signedApprove.error))
          toast.error(isCancelled ? "Transacción cancelada." : `Error firmando (aprobación): ${signedApprove.error}`)
          return
        }
        const submitApprove = await fetch("/api/escrow/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ escrow_id: escrowId, approver_public_key: user.walletAddress, step: "submit_approve", signed_xdr: signedApprove.signedTxXdr })
        })
        const submitApproveData = await submitApprove.json()
        if (!submitApproveData.ok && submitApproveData.error) {
          toast.error("Error enviando aprobación: " + submitApproveData.error)
          return
        }
      }

      // Step 3: release-funds
      const signedRelease = await signStep("release", "liberación")
      if (!signedRelease) return

      const submitRelease = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrow_id: escrowId, approver_public_key: user.walletAddress, step: "submit_release", signed_xdr: signedRelease })
      })
      const submitReleaseData = await submitRelease.json()
      if (submitReleaseData.error) {
        toast.error("Error enviando liberación: " + submitReleaseData.error)
        return
      }

      // Step 4: Final Payout to Beneficiaries
      const signedPayout = await signStep("prepare_payout", "pago a beneficiarios")
      if (!signedPayout) {
        toast.info(t("campaigns.payoutFailure"))
        return
      }

      const submitPayout = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrow_id: escrowId, approver_public_key: user.walletAddress, step: "submit_payout", signed_xdr: signedPayout })
      })
      const submitPayoutData = await submitPayout.json()
      if (submitPayoutData.error) {
        toast.error("Error enviando pago final: " + submitPayoutData.error)
        return
      }

      toast.success(t("campaigns.payoutSuccess"))

      // Mark campaign as completed ONLY after final payout is successful
      try {
        await fetch(`/api/campaigns/${campaignId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" })
        })
      } catch (e) {
        console.error("Failed to update campaign status", e)
      }
      setCampaigns((prev) =>
        prev.map((c) => (c.campaign_id === campaignId ? { ...c, status: "completed" } : c))
      )

    } catch (err: any) {
      alert("Excepción liberando fondos: " + err.message)
    } finally {
      setReleasing(null)
    }
  }


  const visibleCampaigns = canCreate ? campaigns : campaigns.filter((c) => c.status !== "draft")

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-base-content/60">{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("campaigns.title")}</h1>
          <p className="text-sm text-base-content/60">{t("campaigns.subtitle")}</p>
        </div>
        {canCreate ? (
          <Button asChild>
            <Link href="/dashboard/campaigns/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("campaigns.new")}
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("campaigns.new")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {visibleCampaigns.map((c) => {
          const milestones = c.milestones ?? []
          const done = milestones.filter((m) => m.status === "approved").length
          const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0
          return (
            <Card key={c.campaign_id} className="border-base-300/50 overflow-hidden">
              <CardHeader className="pb-3 bg-base-300/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-bold">{c.title}</CardTitle>
                    <StatusBadge status={c.status ?? "draft"} />
                  </div>
                  {canCreate && c.status === "draft" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="font-bold border-base-300 text-base-content/70 hover:bg-base-300/50 hover:text-base-content transition-all"
                      >
                        <Link href={`/dashboard/campaigns/edit/${c.campaign_id}`}>
                          {t("common.edit")}
                        </Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-primary text-primary-content hover:bg-primary/90 shadow-md font-bold"
                        onClick={() => toggleStatus(c.campaign_id, c.status)}
                      >
                        {t("status.publish")}
                      </Button>
                    </div>
                  )}
                  {canCreate && c.status === "active" && c.escrowId && milestones.length > 0 && done === milestones.length && (
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        disabled={releasing === c.campaign_id}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md font-bold"
                        onClick={() => handleReleaseFunds(c.campaign_id, c.escrowId as string)}
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        {releasing === c.campaign_id ? t("common.loading") : t("campaigns.releaseFunds")}
                      </Button>
                      <p className="text-xs text-base-content/50 text-right max-w-[200px]">
                        {t("campaigns.releaseFundsNotice")}
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-content/60">{c.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-base-content/60">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-base-content">
                      {t("campaigns.budget", {
                        amount: (c.cost ?? 0).toLocaleString(),
                        currency: "USDC",
                      })}
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      {t("campaigns.funded", {
                        amount: ((c.donations ?? []).reduce((acc, d) => acc + Number(d.amount), 0)).toLocaleString()
                      })}
                    </span>
                  </div>
                  <span>
                    {t("campaigns.beneficiaries", { count: c.campaignBeneficiaries?.length ?? 0 })}
                  </span>
                  <span>{t("campaigns.milestonesDone", { done, total: milestones.length })}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-base-300">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {canDonate && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                      onClick={() =>
                        setDonatingCampaign({
                          id: String(c.campaign_id),
                          name: c.title,
                          escrowId: c.escrowId || undefined
                        })
                      }
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {t("campaigns.donate")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {donatingCampaign && (
        <DonationModal
          campaignId={donatingCampaign.id}
          campaignName={donatingCampaign.name}
          escrowId={donatingCampaign.escrowId}
          onClose={() => setDonatingCampaign(null)}
        />
      )}
    </div>
  )
}
