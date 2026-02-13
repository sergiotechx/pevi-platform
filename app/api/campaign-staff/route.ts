import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { campaignStaffIncludes } from '@/lib/api-includes'

/**
 * GET /api/campaign-staff
 * Get all campaign staff records with optional pagination and includes
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
      include = campaignStaffIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignStaffIncludes.full
    }

    const campaignStaff = await prisma.campaignStaff.findMany({
      include,
      skip,
      take,
      orderBy: { campaignStaff_id: 'desc' },
    })

    return NextResponse.json(campaignStaff)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/campaign-staff
 * Create a new campaign staff record
 * Body: { campaign_id: number, orgStaff_id: number, role?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const campaignStaff = await prisma.campaignStaff.create({
      data: body,
    })

    return NextResponse.json(campaignStaff, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
