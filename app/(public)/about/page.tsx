"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Building2,
  Users,
  ClipboardCheck,
  ShieldCheck,
  TrendingUp,
  Target,
  Zap,
  Eye,
} from "lucide-react"

const roles = [
  {
    icon: Building2,
    titleKey: "about.roleCorporation",
    descKey: "about.roleCorporationDesc",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    titleKey: "about.roleBeneficiary",
    descKey: "about.roleBeneficiaryDesc",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: ClipboardCheck,
    titleKey: "about.roleEvaluator",
    descKey: "about.roleEvaluatorDesc",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: ShieldCheck,
    titleKey: "about.roleVerifier",
    descKey: "about.roleVerifierDesc",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: TrendingUp,
    titleKey: "about.roleInvestor",
    descKey: "about.roleInvestorDesc",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
]

const features = [
  {
    icon: Target,
    titleKey: "about.featureMilestones",
    descKey: "about.featureMilestonesDesc",
  },
  {
    icon: Eye,
    titleKey: "about.featureTransparency",
    descKey: "about.featureTransparencyDesc",
  },
  {
    icon: Zap,
    titleKey: "about.featureRewards",
    descKey: "about.featureRewardsDesc",
  },
]

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-base-300/50 bg-base-200/30">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
          <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-base-content lg:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-base-content/60">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* What is PEVI */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-base-content">
            {t("about.whatIsTitle")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-base-content/60">
            {t("about.whatIsDesc")}
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-base-300/50 bg-base-200/20">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-base-content">
            {t("about.howItWorks")}
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                titleKey: "about.step1Title",
                descKey: "about.step1Desc",
              },
              {
                step: "2",
                titleKey: "about.step2Title",
                descKey: "about.step2Desc",
              },
              {
                step: "3",
                titleKey: "about.step3Title",
                descKey: "about.step3Desc",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-content">
                  {item.step}
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-base-content">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-base-content/60">
                  {t(item.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-base-content">
          {t("about.coreFeatures")}
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.titleKey} className="border-base-300/50 text-center">
              <CardContent className="flex flex-col items-center py-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-base-content">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-base-content/60">
                  {t(feature.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="border-y border-base-300/50 bg-base-200/20">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-base-content">
            {t("about.rolesTitle")}
          </h2>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.titleKey} className="border-base-300/50">
                <CardContent className="flex items-start gap-4 py-6">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${role.bgColor}`}
                  >
                    <role.icon className={`h-5 w-5 ${role.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-base-content">
                      {t(role.titleKey)}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-base-content/60">
                      {t(role.descKey)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-base-content lg:text-3xl">
          {t("about.ctaTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-base-content/60">
          {t("about.ctaSubtitle")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg">
              {t("public.getStarted")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              {t("public.explore")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
