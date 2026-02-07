"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { users } from "@/lib/mock-data"
import { useTranslation } from "@/lib/i18n-context"

export default function ManageRolesPage() {
  const { t } = useTranslation()
  const evaluators = users.filter((u) => u.role === "evaluator")
  const verifiers = users.filter((u) => u.role === "verifier")

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">{t("manageRoles.title")}</h1><p className="text-sm text-base-content/60">{t("manageRoles.subtitle")}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-base-300/50">
          <CardHeader><CardTitle className="text-base">{t("manageRoles.evaluators", { count: evaluators.length })}</CardTitle></CardHeader>
          <CardContent>
            {evaluators.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-300/30 p-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{u.name.charAt(0)}</div>
                <div><p className="text-sm font-medium text-base-content">{u.name}</p><p className="text-xs text-base-content/60">{u.email}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardHeader><CardTitle className="text-base">{t("manageRoles.verifiers", { count: verifiers.length })}</CardTitle></CardHeader>
          <CardContent>
            {verifiers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-300/30 p-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">{u.name.charAt(0)}</div>
                <div><p className="text-sm font-medium text-base-content">{u.name}</p><p className="text-xs text-base-content/60">{u.email}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
