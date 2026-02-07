"use client"

import { useAuth } from "@/lib/auth-context"
import { CorporationOverview } from "@/components/dashboards/corporation-overview"
import { BeneficiaryOverview } from "@/components/dashboards/beneficiary-overview"
import { EvaluatorOverview } from "@/components/dashboards/evaluator-overview"
import { VerifierOverview } from "@/components/dashboards/verifier-overview"
import { InvestorOverview } from "@/components/dashboards/investor-overview"

export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case "corporation": return <CorporationOverview />
    case "beneficiary": return <BeneficiaryOverview />
    case "evaluator": return <EvaluatorOverview />
    case "verifier": return <VerifierOverview />
    case "angel_investor": return <InvestorOverview />
    default: return <BeneficiaryOverview />
  }
}
