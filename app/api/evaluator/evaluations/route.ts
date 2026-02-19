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

  const activities = await prisma.activity.findMany({
    where: {
      activity_status: { in: ["approved", "rejected"] },
      evidence_status: { in: ["approved", "rejected"] },
      milestone: {
        campaign: { campaignStaff: evaluatorFilter },
      },
    },
    include: {
      milestone: { include: { campaign: true } },
      campaignBeneficiary: { include: { user: true } },
    },
  })

  return NextResponse.json(activities)
}
