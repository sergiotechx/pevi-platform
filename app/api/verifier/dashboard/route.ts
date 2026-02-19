import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  const numericId = parseInt(userId, 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ error: "userId must be a number" }, { status: 400 })
  }

  const verifierFilter = {
    some: {
      role: "verifier",
      organizationStaff: { user_id: numericId },
    },
  }

  const [pendingAudits, verified, assignedCampaigns, recentEvaluations] = await Promise.all([
    // 1. Actividades pendientes de verificación
    prisma.activity.count({
      where: {
        verification_status: "pending",
        milestone: { campaign: { campaignStaff: verifierFilter } },
      },
    }),

    // 2. Actividades verificadas (aprobadas)
    prisma.activity.count({
      where: {
        verification_status: "approved",
        milestone: { campaign: { campaignStaff: verifierFilter } },
      },
    }),

    // 3. Campañas activas asignadas al verificador
    prisma.campaignStaff.count({
      where: {
        role: "verifier",
        organizationStaff: { user_id: numericId },
        campaign: { status: "active" },
      },
    }),

    // 4. Últimas 3 actividades con verification_status = pending
    prisma.activity.findMany({
      where: {
        verification_status: "pending",
        milestone: { campaign: { campaignStaff: verifierFilter } },
      },
      include: {
        milestone: { include: { campaign: true } },
        campaignBeneficiary: { include: { user: true } },
      },
      orderBy: { activity_id: "desc" },
      take: 3,
    }),
  ])

  return NextResponse.json({
    pendingAudits,
    verified,
    assignedCampaigns,
    recentEvaluations: recentEvaluations.map((a) => ({
      activity_id: a.activity_id,
      milestone: {
        name: a.milestone.name,
        campaign: {
          campaign_id: a.milestone.campaign.campaign_id,
          title: a.milestone.campaign.title,
        },
      },
      campaignBeneficiary: {
        user: { fullName: a.campaignBeneficiary.user.fullName },
      },
    })),
  })
}
