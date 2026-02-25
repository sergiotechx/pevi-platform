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
      evidence_status: { in: ["submitted", "pending", "review"] },
      milestone: {
        campaign: {
          campaignStaff: {
            some: {
              role: "evaluator",
              organizationStaff: { user_id: numericId },
            },
          },
        },
      },
    },
    include: {
      milestone: { include: { campaign: true } },
      campaignBeneficiary: { include: { user: true } },
    },
  })

  return NextResponse.json(activities)
}
