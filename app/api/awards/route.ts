import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { awardIncludes } from '@/lib/api-includes'

/**
 * GET /api/awards
 * Get all awards with optional pagination and includes
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
      include = awardIncludes.basic
    } else if (includeParam === 'full') {
      include = awardIncludes.full
    }

    const awards = await prisma.award.findMany({
      include,
      skip,
      take,
      orderBy: { award_id: 'desc' },
    })

    return NextResponse.json(awards)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/awards
 * Create a new award
 * Body: { activity_id: number, hash?: string, status?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const award = await prisma.award.create({
      data: body,
    })

    return NextResponse.json(award, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
