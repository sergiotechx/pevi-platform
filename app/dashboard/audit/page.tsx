"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { evaluations, evidences, users } from "@/lib/mock-data"
import { ShieldCheck, AlertTriangle } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

export default function AuditPage() {
  const { t } = useTranslation()
  const [audited, setAudited] = useState<Record<string, "verified" | "disputed">>({})
  const pendingAudits = evaluations.filter((ev) => ev.verificationStatus === "pending")

  const handleAudit = (id: string, decision: "verified" | "disputed") => {
    setAudited((prev) => ({ ...prev, [id]: decision }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight">Audit Evaluations</h1><p className="text-sm text-base-content/60">Verify or dispute evaluator decisions</p></div>
      {pendingAudits.length === 0 ? (
        <Card className="border-base-300/50"><CardContent className="py-12 text-center"><p className="text-sm text-base-content/60">No pending audits.</p></CardContent></Card>
      ) : (
        pendingAudits.map((ev) => {
          const evidence = evidences.find((e) => e.id === ev.evidenceId)
          const evaluator = users.find((u) => u.id === ev.evaluatorId)
          const isAudited = !!audited[ev.id]
          return (
            <Card key={ev.id} className="border-base-300/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Evaluation #{ev.id}</CardTitle>
                  {isAudited ? <StatusBadge status={audited[ev.id]} /> : <StatusBadge status="pending" />}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div><span className="text-base-content/60">Evaluator:</span> <span className="text-base-content">{evaluator?.name}</span></div>
                  <div><span className="text-base-content/60">Decision:</span> <span className="text-base-content capitalize">{ev.decision}</span></div>
                  <div><span className="text-base-content/60">Date:</span> <span className="text-base-content">{ev.evaluatedAt}</span></div>
                </div>
                <p className="text-sm text-base-content/60">{ev.comment}</p>
                {!isAudited && (
                  <div className="flex gap-3">
                    <Button onClick={() => handleAudit(ev.id, "verified")} className="bg-emerald-600 hover:bg-emerald-700 text-white"><ShieldCheck className="mr-2 h-4 w-4" />Verify</Button>
                    <Button variant="outline" onClick={() => handleAudit(ev.id, "disputed")} className="text-error hover:text-error"><AlertTriangle className="mr-2 h-4 w-4" />Dispute</Button>
                  </div>
                )}
                {isAudited && <p className="text-sm text-emerald-400">Audit recorded: {audited[ev.id]}</p>}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
