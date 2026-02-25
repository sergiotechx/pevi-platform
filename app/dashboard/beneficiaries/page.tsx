"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { AssignmentModal } from "@/components/assignment-modal"
import { UserPlus } from "lucide-react"

type BeneficiaryUser = {
  user_id: number
  fullName: string
  email: string
  campaignBeneficiaries?: { campaignBeneficiary_id: number }[]
}

export default function BeneficiariesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningUser, setAssigningUser] = useState<BeneficiaryUser | null>(null)

  const canAssign = user?.role === "corporation"

  useEffect(() => {
    fetch(`/api/users?role=beneficiary&include=full`)
      .then((r) => r.json())
      .then((data: BeneficiaryUser[]) => setBeneficiaries(Array.isArray(data) ? data : []))
      .catch(() => setBeneficiaries([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex flex-col gap-6"><p className="text-sm text-base-content/60">{t("common.loading")}</p></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("beneficiaries.title")}</h1><p className="text-sm text-base-content/60">{t("beneficiaries.subtitle")}</p></div>
      <div className="flex flex-col gap-3">
        {beneficiaries.map((b) => {
          const enrolled = b.campaignBeneficiaries?.length ?? 0
          return (
            <Card key={b.user_id} className="border-base-300/50 hover:border-primary/30 transition-all">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{b.fullName.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-content">{b.fullName}</p>
                  <p className="text-xs text-base-content/60">{b.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-base-content/40 font-medium">
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
                      {t("beneficiaries.assign")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {assigningUser && (
        <AssignmentModal
          beneficiaryId={assigningUser.user_id}
          beneficiaryName={assigningUser.fullName}
          onClose={() => {
            setAssigningUser(null)
            // Refresh counts
            fetch(`/api/users?role=beneficiary&include=full`)
              .then((r) => r.json())
              .then((data: BeneficiaryUser[]) => setBeneficiaries(Array.isArray(data) ? data : []))
          }}
        />
      )}
    </div>
  )
}

