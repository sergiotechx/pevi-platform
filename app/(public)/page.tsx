"use client"

import Link from "next/link"
import { campaigns } from "@/lib/mock-data"
import { useTranslation } from "@/lib/i18n-context"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Target, ArrowRight, Megaphone } from "lucide-react"

export default function ExploreProjectsPage() {
  const { t } = useTranslation()
  const publishedCampaigns = campaigns.filter(
    (c) => c.status === "active" || c.status === "published"
  )

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-base-300/50 bg-base-200/30">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-base-content lg:text-5xl">
              {t("public.heroTitle")}
            </h1>
            <p className="mt-4 text-pretty text-lg text-base-content/60 lg:text-xl">
              {t("public.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">
                  {t("public.getStarted")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  {t("public.learnMore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-base-300/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-base-300/50 px-4 lg:grid-cols-4 lg:px-8">
          {[
            {
              value: campaigns.length.toString(),
              labelKey: "public.statProjects",
            },
            {
              value: campaigns
                .reduce((acc, c) => acc + c.milestones.length, 0)
                .toString(),
              labelKey: "public.statMilestones",
            },
            {
              value: `${(campaigns.reduce((acc, c) => acc + c.budget, 0) / 1000).toFixed(0)}K`,
              labelKey: "public.statBudget",
            },
            {
              value: new Set(campaigns.flatMap((c) => c.beneficiaries)).size.toString(),
              labelKey: "public.statBeneficiaries",
            },
          ].map((stat) => (
            <div key={stat.labelKey} className="px-4 py-8 text-center lg:px-8">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-base-content/60">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-base-content">
              {t("public.availableProjects")}
            </h2>
            <p className="text-sm text-base-content/60">
              {t("public.availableProjectsSubtitle")}
            </p>
          </div>
        </div>

        {publishedCampaigns.length === 0 ? (
          <div className="rounded-lg border border-base-300/50 bg-base-200/50 p-12 text-center">
            <p className="text-base-content/60">{t("explore.none")}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="group border-base-300/50 transition-colors hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug text-base-content">
                      {campaign.name}
                    </CardTitle>
                    <StatusBadge status={campaign.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-base-content/60">
                    {campaign.description}
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                      <Target className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">{campaign.objectives}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {campaign.startDate} &mdash; {campaign.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-base-300/50 pt-3">
                    <span className="text-xs text-base-content/50">
                      {t("explore.budget", {
                        amount: campaign.budget.toLocaleString(),
                        currency: campaign.currency,
                      })}{" "}
                      &middot;{" "}
                      {t("explore.milestones", {
                        count: campaign.milestones.length,
                      })}
                    </span>
                    <Link href={`/projects/${campaign.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                      >
                        {t("public.viewDetails")}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
