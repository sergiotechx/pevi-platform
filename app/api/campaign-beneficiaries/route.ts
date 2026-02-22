import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { campaignBeneficiaryIncludes } from '@/lib/api-includes'

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

    // Optional filter by user (beneficiary)
    const where = userIdParam ? { user_id: parseInt(userIdParam, 10) } : undefined

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = campaignBeneficiaryIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignBeneficiaryIncludes.full
    }

    const campaignBeneficiaries = await prisma.campaignBeneficiary.findMany({
      where,
      include,
      skip,
      take,
      orderBy: { campaignBeneficiary_id: 'desc' },
    })

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

    const campaignBeneficiary = await prisma.campaignBeneficiary.create({
      data: body,
    })

    return NextResponse.json(campaignBeneficiary, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
