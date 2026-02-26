import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { activityIncludes } from '@/lib/api-includes'

/**
 * GET /api/activities/[id]
 * Get a single activity by ID
 * Query params: ?include=basic|full
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = validateId(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const includeParam = searchParams.get('include')

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = activityIncludes.basic
    } else if (includeParam === 'full') {
      include = activityIncludes.full
    }

    const activity = await prisma.activity.findUnique({
      where: { activity_id: id },
      include,
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json(activity)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/activities/[id]
 * Update an existing activity
 * Body: {
 *   milestone_id?: number,
 *   campaignBeneficiary_id?: number,
 *   activity_status?: string,
 *   evidence_status?: string,
 *   verification_status?: string,
 *   evidence_ref?: string,
 *   activity_observation?: string,
 *   evaluation_note?: string,
 *   verification_note?: string
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = validateId(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const body = await request.json()
    const { approver_public_key, final_tx_hash, ...updateData } = body

    const activity = await prisma.activity.update({
      where: { activity_id: id },
      data: updateData,
      include: {
        award: true,
        milestone: true,
      }
    })

    if ((updateData.verification_status === "approved" || updateData.activity_status === "approved") && activity.award?.award_id) {
      if (final_tx_hash) {
        await prisma.award.update({
          where: { award_id: activity.award.award_id },
          data: { hash: final_tx_hash },
        })
      }
    }

    if (updateData.verification_status === "approved" || updateData.activity_status === "approved") {
      try {
        const fullActivity = await prisma.activity.findUnique({
          where: { activity_id: id },
          include: {
            milestone: {
              include: { campaign: { include: { organization: { include: { organizationStaff: true } } } } }
            },
            campaignBeneficiary: { include: { user: true } }
          }
        })

        if (fullActivity?.milestone && fullActivity?.campaignBeneficiary) {
          const milestoneId = fullActivity.milestone.milestone_id
          const milestoneName = fullActivity.milestone.name || `Milestone ${milestoneId}`
          const campaignTitle = fullActivity.milestone.campaign.title
          const beneficiaryUser = fullActivity.campaignBeneficiary.user
          const organizationStaff = fullActivity.milestone.campaign.organization?.organizationStaff || []
          const notifications = []

          // If the activity is fully approved, also approve the parent milestone
          await prisma.milestone.update({
            where: { milestone_id: milestoneId },
            data: { status: "approved" }
          })

          // Notify Beneficiary
          if (beneficiaryUser) {
            notifications.push({
              user_id: beneficiaryUser.user_id,
              title: "notifications.milestoneApprovedTitle",
              message: "notifications.milestoneApprovedMessage",
              metadata: { milestone: milestoneName, campaign: campaignTitle },
              type: "milestone",
              actionUrl: "/dashboard/progress",
              actionLabel: "notifications.viewProgress"
            })
          }

          // Notify Corporation
          for (const staff of organizationStaff) {
            if (staff.user_id) {
              notifications.push({
                user_id: staff.user_id,
                title: "notifications.corpMilestoneApprovedTitle",
                message: "notifications.corpMilestoneApprovedMessage",
                metadata: { milestone: milestoneName, beneficiary: beneficiaryUser?.fullName || "Un beneficiario" },
                type: "milestone",
                actionUrl: "/dashboard/campaigns",
                actionLabel: "notifications.viewCampaign"
              })
            }
          }

          if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications as any })
          }
        }
      } catch (notifyErr) {
        console.error("Failed to notify milestone approval:", notifyErr)
      }
    } else if (updateData.evidence_status === "submitted") {
      try {
        const fullActivity = await prisma.activity.findUnique({
          where: { activity_id: id },
          include: {
            milestone: {
              include: { campaign: { include: { organization: { include: { organizationStaff: true } } } } }
            },
            campaignBeneficiary: { include: { user: true } }
          }
        })

        if (fullActivity?.milestone && fullActivity?.campaignBeneficiary) {
          const milestoneName = fullActivity.milestone.name || `Milestone ${fullActivity.milestone.milestone_id}`
          const beneficiaryUser = fullActivity.campaignBeneficiary.user
          const organizationStaff = fullActivity.milestone.campaign.organization?.organizationStaff || []

          // Also fetch campaign-assigned evaluators
          const campaignStaff = await prisma.campaignStaff.findMany({
            where: { campaign_id: fullActivity.milestone.campaign_id, role: 'evaluator' },
            include: { organizationStaff: { select: { user_id: true } } }
          })

          const notifications = []

          // Notify Corporation Staff
          for (const staff of organizationStaff) {
            if (staff.user_id) {
              notifications.push({
                user_id: staff.user_id,
                title: "notifications.evidenceSubmittedTitle",
                message: "notifications.evidenceSubmittedMessage",
                metadata: { milestone: milestoneName, beneficiary: beneficiaryUser?.fullName || "Un beneficiario" },
                type: "evidence",
                actionUrl: "/dashboard/evaluations",
                actionLabel: "notifications.viewEvaluations"
              })
            }
          }

          // Notify Campaign Evaluators
          const notifiedUserIds = new Set(notifications.map(n => n.user_id))
          for (const staff of campaignStaff) {
            const userId = staff.organizationStaff.user_id
            if (userId && !notifiedUserIds.has(userId)) {
              notifications.push({
                user_id: userId,
                title: "notifications.evidenceSubmittedTitle",
                message: "notifications.evidenceSubmittedMessage",
                metadata: { milestone: milestoneName, beneficiary: beneficiaryUser?.fullName || "Un beneficiario" },
                type: "evidence",
                actionUrl: "/dashboard/evaluations",
                actionLabel: "notifications.viewEvaluations"
              })
            }
          }

          if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications as any })
          }
        }
      } catch (notifyErr) {
        console.error("Failed to notify evidence submitted:", notifyErr)
      }
    } else if (updateData.evidence_status === "rejected" || updateData.verification_status === "rejected") {
      try {
        const fullActivity = await prisma.activity.findUnique({
          where: { activity_id: id },
          include: {
            milestone: true,
            campaignBeneficiary: { include: { user: true } }
          }
        })

        if (fullActivity?.milestone && fullActivity?.campaignBeneficiary?.user) {
          const milestoneName = fullActivity.milestone.name || `Milestone ${fullActivity.milestone.milestone_id}`
          const beneficiaryUser = fullActivity.campaignBeneficiary.user

          await prisma.notification.create({
            data: {
              user_id: beneficiaryUser.user_id,
              title: "notifications.evidenceRejectedTitle",
              message: "notifications.evidenceRejectedMessage",
              metadata: { milestone: milestoneName },
              type: "evidence",
              actionUrl: "/dashboard/progress",
              actionLabel: "notifications.viewProgress"
            } as any
          })
        }
      } catch (notifyErr) {
        console.error("Failed to notify evidence rejection:", notifyErr)
      }
    }

    return NextResponse.json(activity)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/activities/[id]
 * Delete an activity
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = validateId(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    await prisma.activity.delete({
      where: { activity_id: id },
    })

    return NextResponse.json({ message: 'Activity deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
