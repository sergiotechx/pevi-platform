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

  const evaluatorFilter = {
    some: {
      role: "evaluator",
      organizationStaff: { user_id: numericId },
    },
  }

  const [staffRows, pendingReviews, totalEvaluations] = await Promise.all([
    // 1. Campañas asignadas al evaluador
    prisma.campaignStaff.findMany({
      where: {
        role: "evaluator",
        organizationStaff: { user_id: numericId },
      },
      include: { campaign: true },
    }),

    // 2. Actividades pendientes de revisión
    prisma.activity.findMany({
      where: {
        evidence_status: { in: ["submitted", "pending", "review"] },
        milestone: {
          campaign: {
            campaignStaff: evaluatorFilter,
          },
        },
      },
      include: {
        milestone: {
          include: { campaign: true },
        },
      },
    }),

    // 3. Total evaluaciones completadas por el evaluador
    prisma.activity.count({
      where: {
        evidence_status: { in: ["approved", "rejected"] },
        milestone: {
          campaign: {
            campaignStaff: evaluatorFilter,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    assignedCampaigns: staffRows.map((s) => s.campaign),
    pendingReviews: pendingReviews.map((a) => ({
      activity_id: a.activity_id,
      activity_observation: a.activity_observation,
      evidence_ref: a.evidence_ref,
      milestone: {
        milestone_id: a.milestone.milestone_id,
        name: a.milestone.name,
        campaign: {
          campaign_id: a.milestone.campaign.campaign_id,
          title: a.milestone.campaign.title,
        },
      },
    })),
    totalEvaluations,
  })
}
