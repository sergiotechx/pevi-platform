import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { campaignBeneficiaryIncludes } from '@/lib/api-includes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/campaign-beneficiaries
 * Get all campaign beneficiaries with optional pagination and includes
 * Query params: ?page=1&limit=10&include=basic|full
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, take } = parsePagination(searchParams)
    const includeParam = searchParams.get('include')
    const userIdParam = searchParams.get('user_id')
    const campaignIdParam = searchParams.get('campaign_id')
    const orgIdParam = searchParams.get('org_id')
    const statusParam = searchParams.get('status')

    // Prepare where clause
    const where: any = {}
    if (userIdParam) where.user_id = parseInt(userIdParam, 10)
    if (campaignIdParam) where.campaign_id = parseInt(campaignIdParam, 10)
    if (statusParam) where.status = statusParam
    if (orgIdParam) {
      where.campaign = { org_id: parseInt(orgIdParam, 10) }
    }

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = campaignBeneficiaryIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignBeneficiaryIncludes.full
    }

    const campaignBeneficiaries = await prisma.campaignBeneficiary.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include,
      skip,
      take,
      orderBy: { campaignBeneficiary_id: 'desc' },
    })
    console.log(`[API] GET /api/campaign-beneficiaries - Found ${campaignBeneficiaries.length} records. Statuses:`, campaignBeneficiaries.map((cb: any) => cb.status))

    return NextResponse.json(campaignBeneficiaries)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/campaign-beneficiaries
 * Create a new campaign beneficiary
 * Body: { campaign_id: number, user_id: number, status: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("POST /api/campaign-beneficiaries - body:", body)

    const campaignBeneficiary = await prisma.campaignBeneficiary.upsert({
      where: {
        campaign_id_user_id: {
          campaign_id: body.campaign_id,
          user_id: body.user_id,
        }
      },
      update: {
        status: body.status,
      },
      create: {
        campaign_id: body.campaign_id,
        user_id: body.user_id,
        status: body.status,
      },
    })

    // Create notifications based on status
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { campaign_id: body.campaign_id },
        select: { title: true, org_id: true }
      })

      if (campaign && body.user_id) {
        // 1. Notify the beneficiary (Welcome/Invitation notification)
        await prisma.notification.create({
          data: {
            user_id: body.user_id,
            title: body.status === "pending" ? "public.applicationPending" : "progress.invitation",
            message: body.status === "pending" ? "public.applicationPendingSubtitle" : "progress.invitationMessage",
            type: "progress",
            metadata: { campaign: campaign.title },
            actionUrl: `/dashboard/progress?campaignId=${body.campaign_id}`,
            actionLabel: "notifications.viewCampaign"
          }
        })

        // 2. If status is pending, notify the Corporation (Organization Staff)
        if (body.status === "pending") {
          const beneficiary = await prisma.user.findUnique({
            where: { user_id: body.user_id },
            select: { fullName: true }
          })

          const corpStaff = await prisma.organizationStaff.findMany({
            where: { org_id: campaign.org_id },
            select: { user_id: true }
          })

          const corpNotifications = corpStaff.map(staff => ({
            user_id: staff.user_id,
            title: "notifications.applicationRequestedTitle",
            message: "notifications.applicationRequestedMessage",
            type: "campaign",
            metadata: {
              campaign: campaign.title,
              beneficiary: beneficiary?.fullName || "A beneficiary"
            },
            actionUrl: `/dashboard/beneficiaries?campaignId=${body.campaign_id}`,
            actionLabel: "notifications.viewApplications"
          }))

          if (corpNotifications.length > 0) {
            await prisma.notification.createMany({
              data: corpNotifications as any
            })
          }
        }

        console.log(`[API] Created enrollment notifications for user ${body.user_id} regarding campaign ${body.campaign_id}`)
      }
    } catch (notifyErr) {
      console.error("Failed to create enrollment notifications:", notifyErr)
    }

    return NextResponse.json(campaignBeneficiary, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign beneficiary:", error)
    return handleApiError(error)
  }
}
