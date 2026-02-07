"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { campaigns, users } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  CalendarDays,
  Target,
  DollarSign,
  Users as UsersIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

const milestoneIcons: Record<string, typeof CheckCircle2> = {
  approved: CheckCircle2,
  submitted: Loader2,
  in_progress: Clock,
  pending: AlertCircle,
  rejected: AlertCircle,
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()

  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) {
    notFound()
  }

  const evaluator = campaign.evaluatorId
    ? users.find((u) => u.id === campaign.evaluatorId)
    : null
  const verifier = campaign.verifierId
    ? users.find((u) => u.id === campaign.verifierId)
    : null

  const isAlreadyBeneficiary =
    isAuthenticated && user
      ? campaign.beneficiaries.includes(user.id)
      : false

  const approvedMilestones = campaign.milestones.filter(
    (m) => m.status === "approved"
  ).length
  const progressPercent =
    campaign.milestones.length > 0
      ? Math.round((approvedMilestones / campaign.milestones.length) * 100)
      : 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-base-content/60 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("public.backToProjects")}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-balance font-heading text-3xl font-bold tracking-tight text-base-content">
            {campaign.name}
          </h1>
          <StatusBadge status={campaign.status} />
        </div>
        <p className="mt-1 text-sm text-base-content/50">
          {t("public.by")} {campaign.corporationName}
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-base-300/50">
          <CardContent className="flex flex-col items-center py-4">
            <DollarSign className="mb-1 h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-base-content">
              {campaign.budget.toLocaleString()}
            </p>
            <p className="text-xs text-base-content/50">{campaign.currency}</p>
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardContent className="flex flex-col items-center py-4">
            <Target className="mb-1 h-5 w-5 text-secondary" />
            <p className="text-lg font-bold text-base-content">
              {campaign.milestones.length}
            </p>
            <p className="text-xs text-base-content/50">
              {t("common.milestones")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardContent className="flex flex-col items-center py-4">
            <UsersIcon className="mb-1 h-5 w-5 text-accent" />
            <p className="text-lg font-bold text-base-content">
              {campaign.beneficiaries.length}
            </p>
            <p className="text-xs text-base-content/50">
              {t("public.beneficiaries")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardContent className="flex flex-col items-center py-4">
            <CalendarDays className="mb-1 h-5 w-5 text-info" />
            <p className="text-sm font-bold text-base-content">
              {campaign.startDate}
            </p>
            <p className="text-xs text-base-content/50">
              {campaign.endDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description & Objectives */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-base-300/50">
          <CardHeader>
            <CardTitle className="text-base text-base-content">
              {t("common.description")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-base-content/70">
              {campaign.description}
            </p>
          </CardContent>
        </Card>
        <Card className="border-base-300/50">
          <CardHeader>
            <CardTitle className="text-base text-base-content">
              {t("public.objectives")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-base-content/70">
              {campaign.objectives}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team */}
      {(evaluator || verifier) && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {evaluator && (
            <div className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-200/50 px-4 py-3">
              <UserCheck className="h-5 w-5 text-info" />
              <div>
                <p className="text-xs text-base-content/50">
                  {t("public.evaluator")}
                </p>
                <p className="text-sm font-medium text-base-content">
                  {evaluator.name}
                </p>
              </div>
            </div>
          )}
          {verifier && (
            <div className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-200/50 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-base-content/50">
                  {t("public.verifier")}
                </p>
                <p className="text-sm font-medium text-base-content">
                  {verifier.name}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestones */}
      <Card className="mb-8 border-base-300/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-base-content">
              {t("common.milestones")}
            </CardTitle>
            <span className="text-xs text-base-content/50">
              {approvedMilestones}/{campaign.milestones.length}{" "}
              {t("public.completed")}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-base-300">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {campaign.milestones.map((milestone, idx) => {
              const Icon = milestoneIcons[milestone.status] || AlertCircle
              return (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 rounded-lg border border-base-300/30 bg-base-200/30 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-300/50">
                    <Icon className="h-4 w-4 text-base-content/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-base-content">
                          {idx + 1}. {milestone.title}
                        </p>
                        <p className="mt-0.5 text-xs text-base-content/50">
                          {milestone.description}
                        </p>
                      </div>
                      <StatusBadge status={milestone.status} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-primary">
                      {t("common.reward")}: {milestone.reward} USDC
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center">
          {!isAuthenticated ? (
            <>
              <h3 className="font-heading text-lg font-bold text-base-content">
                {t("public.ctaLoginTitle")}
              </h3>
              <p className="mt-2 text-sm text-base-content/60">
                {t("public.ctaLoginSubtitle")}
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/login">
                  <Button>{t("public.login")}</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">{t("public.signup")}</Button>
                </Link>
              </div>
            </>
          ) : isAlreadyBeneficiary ? (
            <>
              <h3 className="font-heading text-lg font-bold text-emerald-500">
                {t("public.alreadyEnrolled")}
              </h3>
              <p className="mt-2 text-sm text-base-content/60">
                {t("public.alreadyEnrolledSubtitle")}
              </p>
              <div className="mt-5">
                <Link href="/dashboard/progress">
                  <Button>{t("public.goToDashboard")}</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-heading text-lg font-bold text-base-content">
                {t("public.ctaJoinTitle")}
              </h3>
              <p className="mt-2 text-sm text-base-content/60">
                {t("public.ctaJoinSubtitle")}
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {(user?.role === "beneficiary" ||
                  user?.role === "angel_investor") && (
                  <Button>{t("public.joinProject")}</Button>
                )}
                <Link href="/dashboard">
                  <Button variant="outline">
                    {t("public.goToDashboard")}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
