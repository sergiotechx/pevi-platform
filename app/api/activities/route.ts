import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { activityIncludes } from '@/lib/api-includes'

/**
 * GET /api/activities
 * Get all activities with optional pagination and includes
 * Query params: ?page=1&limit=10&include=basic|full
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, take } = parsePagination(searchParams)
    const includeParam = searchParams.get('include')

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = activityIncludes.basic
    } else if (includeParam === 'full') {
      include = activityIncludes.full
    }

    const activities = await prisma.activity.findMany({
      include,
      skip,
      take,
      orderBy: { activity_id: 'desc' },
    })

    return NextResponse.json(activities)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/activities
 * Create a new activity
 * Body: {
 *   milestone_id: number,
 *   campaignBeneficiary_id: number,
 *   activity_status?: string,
 *   evidence_status?: string,
 *   verification_status?: string,
 *   evidence_ref?: string,
 *   activity_observation?: string,
 *   evaluation_note?: string,
 *   verification_note?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const activity = await prisma.activity.create({
      data: body,
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
