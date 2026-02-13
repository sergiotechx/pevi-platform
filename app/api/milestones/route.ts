import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { milestoneIncludes } from '@/lib/api-includes'

/**
 * GET /api/milestones
 * Get all milestones with optional pagination and includes
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
      include = milestoneIncludes.basic
    } else if (includeParam === 'full') {
      include = milestoneIncludes.full
    }

    const milestones = await prisma.milestone.findMany({
      include,
      skip,
      take,
      orderBy: { milestone_id: 'desc' },
    })

    return NextResponse.json(milestones)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/milestones
 * Create a new milestone
 * Body: { campaign_id: number, name?: string, description?: string, due_at?: string, status?: string, total_amount?: number, currency?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const milestone = await prisma.milestone.create({
      data: body,
    })

    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
