import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { campaignIncludes } from '@/lib/api-includes'

/**
 * GET /api/campaigns/[id]
 * Get a single campaign by ID
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
      include = campaignIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignIncludes.full
    }

    const campaign = await prisma.campaign.findUnique({
      where: { campaign_id: id },
      include,
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/campaigns/[id]
 * Update an existing campaign
 * Body: { org_id?: number, title?: string, description?: string, cost?: number, start_at?: string, status?: string }
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

    const campaign = await prisma.campaign.update({
      where: { campaign_id: id },
      data: body,
    })

    return NextResponse.json(campaign)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign
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

    await prisma.campaign.delete({
      where: { campaign_id: id },
    })

    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
