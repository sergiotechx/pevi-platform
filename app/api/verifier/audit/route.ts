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

  const activities = await prisma.activity.findMany({
    where: {
      verification_status: "pending",
      evidence_status: { not: "pending" },
      milestone: {
        campaign: {
          campaignStaff: {
            some: {
              role: "verifier",
              organizationStaff: { user_id: numericId },
            },
          },
        },
      },
    },
    include: {
      milestone: {
        include: {
          campaign: {
            include: {
              campaignStaff: {
                where: { role: "evaluator" },
                include: { organizationStaff: { include: { user: true } } },
              },
            },
          },
        },
      },
      campaignBeneficiary: { include: { user: true } },
    },
  })

  return NextResponse.json(
    activities.map((a) => ({
      activity_id: a.activity_id,
      activity_status: a.activity_status,
      evidence_status: a.evidence_status,
      verification_status: a.verification_status,
      verification_note: a.verification_note,
      activity_observation: a.activity_observation,
      evidence_ref: a.evidence_ref,
      evaluation_note: a.evaluation_note,
      evaluator_name: a.milestone.campaign.campaignStaff?.[0]?.organizationStaff?.user?.fullName ?? null,
      milestone: {
        milestone_id: a.milestone.milestone_id,
        name: a.milestone.name,
        campaign: {
          campaign_id: a.milestone.campaign.campaign_id,
          title: a.milestone.campaign.title,
        },
      },
      campaignBeneficiary: {
        user: { fullName: a.campaignBeneficiary.user.fullName },
      },
    }))
  )
}
