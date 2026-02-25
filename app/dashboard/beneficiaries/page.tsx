"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { AssignmentModal } from "@/components/assignment-modal"
import { UserPlus, Check, X } from "lucide-react"

type BeneficiaryUser = {
  user_id: number
  fullName: string
  email: string
  campaignBeneficiaries?: { campaignBeneficiary_id: number }[]
}

type PendingRequest = {
  campaignBeneficiary_id: number
  campaign_id: number
  user_id: number
  status: string
  campaign: { title: string }
  user: { fullName: string; email: string }
}

export default function BeneficiariesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryUser[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningUser, setAssigningUser] = useState<BeneficiaryUser | null>(null)
  const [tab, setTab] = useState<"all" | "pending">("all")
  const [processing, setProcessing] = useState<number | null>(null)

  const canAssign = user?.role === "corporation"

  useEffect(() => {
    if (searchParams.get("campaignId")) {
      setTab("pending")
    }
  }, [searchParams])

  const fetchBeneficiaries = async () => {
    try {
      const r = await fetch(`/api/users?role=beneficiary&include=full`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      const data = await r.json()
      setBeneficiaries(Array.isArray(data) ? data : [])
    } catch {
      setBeneficiaries([])
    }
  }

  const fetchPendingRequests = async () => {
    if (!canAssign || !user?.orgId) return
    try {
      let url = `/api/campaign-beneficiaries?org_id=${user.orgId}&status=pending&include=full`
      const campaignId = searchParams.get("campaignId")
      if (campaignId) {
        url += `&campaign_id=${campaignId}`
      }
      const r = await fetch(url, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      const data = await r.json()
      setPendingRequests(Array.isArray(data) ? data : [])
    } catch {
      setPendingRequests([])
    }
  }

  useEffect(() => {
    Promise.all([fetchBeneficiaries(), fetchPendingRequests()]).finally(() => setLoading(false))
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id: number, status: "active" | "rejected") => {
    setProcessing(id)
    try {
      await fetch(`/api/campaign-beneficiaries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      await Promise.all([fetchPendingRequests(), fetchBeneficiaries()])
    } catch (e) {
      console.error(e)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return <div className="flex flex-col gap-6"><p className="text-sm text-base-content/60">{t("common.loading")}</p></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("beneficiaries.title")}</h1>
        <p className="text-sm text-base-content/60">{t("beneficiaries.subtitle")}</p>
      </div>

      {canAssign && (
        <div className="flex items-center gap-2 border-b border-base-300/30 pb-2">
          <Button
            variant={tab === "all" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setTab("all")}
            className={tab === "all" ? "bg-base-200" : ""}
          >
            {t("beneficiaries.tabs.all")}
          </Button>
          <Button
            variant={tab === "pending" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setTab("pending")}
            className={tab === "pending" ? "bg-base-200 flex items-center gap-2" : "flex items-center gap-2"}
          >
            {t("beneficiaries.tabs.pending")}
            {pendingRequests.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary px-1">
                {pendingRequests.length}
              </span>
            )}
          </Button>
        </div>
      )}

      {tab === "all" && (
        <div className="flex flex-col gap-3">
          {beneficiaries.map((b) => {
            const enrolled = b.campaignBeneficiaries?.length ?? 0
            return (
              <Card key={b.user_id} className="border-base-300/50 hover:border-primary/30 transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{b.fullName.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{b.fullName}</p>
                    <p className="text-xs text-base-content/60 truncate">{b.email}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="hidden sm:inline-block text-xs text-base-content/40 font-medium whitespace-nowrap">
                      {t("beneficiaries.campaigns", { count: enrolled })}
                    </span>
                    {canAssign && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAssigningUser(b)}
                        className="h-8 gap-2 border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline-block">{t("beneficiaries.assign")}</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {tab === "pending" && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t("beneficiaries.pendingRequests")}</h2>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-base-content/50">{t("beneficiaries.noPendingRequests")}</p>
          ) : (
            pendingRequests.map((req) => (
              <Card key={req.campaignBeneficiary_id} className="border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all">
                <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-sm font-semibold text-amber-600 shrink-0">
                    {req.user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{req.user.fullName}</p>
                    <p className="text-xs text-base-content/60 truncate">{req.user.email}</p>
                    <div className="mt-1 text-xs font-medium text-amber-600/80 bg-amber-500/10 inline-block px-2 py-0.5 rounded-full">
                      {req.campaign.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(req.campaignBeneficiary_id, "active")}
                      disabled={processing === req.campaignBeneficiary_id}
                      className="h-8 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                    >
                      {processing === req.campaignBeneficiary_id ? <span className="loading loading-spinner loading-xs" /> : <Check className="h-4 w-4" />}
                      {t("beneficiaries.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(req.campaignBeneficiary_id, "rejected")}
                      disabled={processing === req.campaignBeneficiary_id}
                      className="h-8 gap-1.5 border-error/30 text-error hover:bg-error/10 hover:text-error"
                    >
                      <X className="h-4 w-4" />
                      {t("beneficiaries.reject")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {assigningUser && (
        <AssignmentModal
          beneficiaryId={assigningUser.user_id}
          beneficiaryName={assigningUser.fullName}
          onClose={() => {
            setAssigningUser(null)
            fetchBeneficiaries()
          }}
        />
      )}
    </div>
  )
}

