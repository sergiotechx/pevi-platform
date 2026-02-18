"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DonationModal } from "@/components/donation-modal"
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
} from "lucide-react"

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

interface Milestone {
  milestone_id: number
  name: string
  status: string
  total_amount: number
}

interface CampaignBeneficiary {
  campaignBeneficiary_id: number
  user_id: number
}

interface Organization {
  org_id: number
  name: string
}

interface Campaign {
  campaign_id: number
  title: string
  description: string
  cost: number
  start_at: string
  status: string
  organization: Organization | null
  milestones: Milestone[]
  campaignBeneficiaries: CampaignBeneficiary[]
}

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
  const [showDonation, setShowDonation] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

  useEffect(() => {
    fetch(`/api/campaigns/${id}?include=basic`)
      .then((r) => {
        if (r.status === 404) { setNotFoundFlag(true); return null }
        return r.json()
      })
      .then((data) => { if (data) setCampaign(data) })
      .finally(() => setLoading(false))
  }, [id])

  if (notFoundFlag) notFound()

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="rounded-lg border border-base-300/50 bg-base-200/50 p-12 text-center">
          <p className="text-base-content/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!campaign) return null

  const isAlreadyBeneficiary =
    isAuthenticated && user
      ? campaign.campaignBeneficiaries.some(
          (cb) => cb.user_id === parseInt(user.id, 10)
        )
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
            {campaign.title}
          </h1>
          <StatusBadge status={campaign.status} />
        </div>
        {campaign.organization && (
          <p className="mt-1 text-sm text-base-content/50">
            {t("public.by")} {campaign.organization.name}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-base-300/50">
          <CardContent className="flex flex-col items-center py-4">
            <DollarSign className="mb-1 h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-base-content">
              {formatNumber(campaign.cost ?? 0)}
            </p>
            <p className="text-xs text-base-content/50">USDC</p>
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
              {campaign.campaignBeneficiaries.length}
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
              {campaign.start_at}
            </p>
            <p className="text-xs text-base-content/50">
              {t("explore.startDate") || "Start date"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <div className="mb-8">
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
      </div>

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
                  key={milestone.milestone_id}
                  className="flex items-start gap-3 rounded-lg border border-base-300/30 bg-base-200/30 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-300/50">
                    <Icon className="h-4 w-4 text-base-content/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-base-content">
                        {idx + 1}. {milestone.name}
                      </p>
                      <StatusBadge status={milestone.status} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-primary">
                      {t("common.reward")}: {formatNumber(milestone.total_amount)} USDC
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
                {user?.role === "beneficiary" && (
                  <Button>{t("public.joinProject")}</Button>
                )}
                {user?.role === "angel_investor" && (
                  <Button onClick={() => setShowDonation(true)}>
                    {t("public.joinProject")}
                  </Button>
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

      {showDonation && (
        <DonationModal
          campaignId={campaign.campaign_id.toString()}
          campaignName={campaign.title}
          onClose={() => setShowDonation(false)}
        />
      )}
    </div>
  )
}
