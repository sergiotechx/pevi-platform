"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

interface DonationItem {
  donation_id: number
  amount: number
  date: string
  hash: string | null
  campaign: { title: string }
}

type ActivityWithAward = {
  activity_id: number
  milestone: { name: string | null; total_amount: number | null; currency: string | null }
  award: { status: string | null; hash: string | null } | null
}

type EnrollmentItem = { activities?: ActivityWithAward[] }

export default function PaymentsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [rewardItems, setRewardItems] = useState<{ milestoneName: string; amount: number; currency: string; status: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    const isBeneficiary = user.role === "beneficiary"
    if (isBeneficiary) {
      fetch(`/api/campaign-beneficiaries?user_id=${user.id}&include=full`)
        .then((r) => r.json())
        .then((data: EnrollmentItem[]) => {
          const list: { milestoneName: string; amount: number; currency: string; status: string }[] = []
          ;(Array.isArray(data) ? data : []).forEach((e) => {
            (e.activities ?? []).forEach((a) => {
              if (a.award) {
                list.push({
                  milestoneName: a.milestone?.name ?? "",
                  amount: Number(a.milestone?.total_amount ?? 0),
                  currency: a.milestone?.currency ?? "USDC",
                  status: a.award.hash ? "completed" : (a.award.status ?? "pending"),
                })
              }
            })
          })
          setRewardItems(list)
        })
        .catch(() => setRewardItems([]))
        .finally(() => setLoading(false))
    } else {
      fetch(`/api/donations?user_id=${user.id}`)
        .then((r) => r.json())
        .then((data: DonationItem[]) => setDonations(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false))
    }
  }, [user?.id, user?.role])

  const isBeneficiary = user?.role === "beneficiary"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("payments.title")}</h1>
        <p className="text-sm text-base-content/60">{t("payments.subtitle")}</p>
      </div>
      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("payments.history")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {loading ? (
              <p className="text-sm text-base-content/60">{t("common.loading")}</p>
            ) : isBeneficiary ? (
              rewardItems.length === 0 ? (
                <p className="text-sm text-base-content/60">{t("notifications.empty")}</p>
              ) : (
                rewardItems.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                    <div>
                      <p className="text-sm font-medium text-base-content">{t("payments.milestone")}: {r.milestoneName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-base-content">
                        {t("payments.amount", { amount: r.amount, currency: r.currency })}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))
              )
            ) : donations.length === 0 ? (
              <p className="text-sm text-base-content/60">{t("notifications.empty")}</p>
            ) : (
              donations.map((d) => (
                <div key={d.donation_id} className="flex items-center justify-between rounded-lg border border-base-300/50 bg-base-300/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-base-content">{d.campaign.title}</p>
                    <p className="text-xs text-base-content/60">{new Date(d.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-base-content">
                      {t("payments.amount", { amount: d.amount, currency: "USDC" })}
                    </span>
                    <StatusBadge status={d.hash ? "completed" : "pending"} />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
