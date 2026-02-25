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
    const { approver_public_key, ...updateData } = body

    const activity = await prisma.activity.update({
      where: { activity_id: id },
      data: updateData,
      include: {
        award: true,
        milestone: true,
      }
    })

    if ((updateData.verification_status === "approved" || updateData.activity_status === "approved") && activity.award?.award_id) {
      if (activity.milestone?.escrowId && approver_public_key) {
        try {
          const { releaseEscrow } = await import('@/lib/trustlesswork')
          const { signedXdr } = await releaseEscrow({
            escrowId: activity.milestone.escrowId,
            approverPublicKey: approver_public_key,
          })
          if (signedXdr) {
            await prisma.award.update({
              where: { award_id: activity.award.award_id },
              data: { hash: signedXdr },
            })
          }
        } catch (escrowError) {
          console.error("Failed to release escrow:", escrowError)
        }
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
