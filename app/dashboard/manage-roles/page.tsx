"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

type StaffUser = {
  user_id: number
  fullName: string
  email: string
}

export default function ManageRolesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [evaluators, setEvaluators] = useState<StaffUser[]>([])
  const [verifiers, setVerifiers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.orgId) {
      setLoading(false)
      return
    }

    const orgId = user.orgId
    Promise.all([
      fetch(`/api/users?role=evaluator&orgId=${orgId}`).then((r) => r.json()),
      fetch(`/api/users?role=verifier&orgId=${orgId}`).then((r) => r.json()),
    ])
      .then(([evalData, verData]) => {
        setEvaluators(Array.isArray(evalData) ? evalData : [])
        setVerifiers(Array.isArray(verData) ? verData : [])
      })
      .catch(() => { setEvaluators([]); setVerifiers([]) })
      .finally(() => setLoading(false))
  }, [user?.orgId])

  if (loading) {
    return <div className="flex flex-col gap-6"><p className="text-sm text-base-content/60">{t("common.loading")}</p></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("manageRoles.title")}</h1><p className="text-sm text-base-content/60">{t("manageRoles.subtitle")}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-base-300/50">
          <CardHeader><CardTitle className="text-base">{t("manageRoles.evaluators", { count: evaluators.length })}</CardTitle></CardHeader>
          <CardContent>
            {evaluators.map((u) => (
              <div key={u.user_id} className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-300/30 p-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{u.fullName.charAt(0)}</div>
                <div><p className="text-sm font-medium text-base-content">{u.fullName}</p><p className="text-xs text-base-content/60">{u.email}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardHeader><CardTitle className="text-base">{t("manageRoles.verifiers", { count: verifiers.length })}</CardTitle></CardHeader>
          <CardContent>
            {verifiers.map((u) => (
              <div key={u.user_id} className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-300/30 p-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">{u.fullName.charAt(0)}</div>
                <div><p className="text-sm font-medium text-base-content">{u.fullName}</p><p className="text-xs text-base-content/60">{u.email}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

