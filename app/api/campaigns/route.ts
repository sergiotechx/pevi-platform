import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { campaignIncludes } from '@/lib/api-includes'

/**
 * GET /api/campaigns
 * Get all campaigns with optional pagination and includes
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
      include = campaignIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignIncludes.full
    }

    const campaigns = await prisma.campaign.findMany({
      include,
      skip,
      take,
      orderBy: { campaign_id: 'desc' },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 * Body: { org_id: number, title: string, description?: string, cost?: number, start_at?: string, status?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const campaign = await prisma.campaign.create({
      data: body,
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
