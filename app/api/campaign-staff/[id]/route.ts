import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { campaignStaffIncludes } from '@/lib/api-includes'

/**
 * GET /api/campaign-staff/[id]
 * Get a single campaign staff record by ID
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
      include = campaignStaffIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignStaffIncludes.full
    }

    const campaignStaff = await prisma.campaignStaff.findUnique({
      where: { campaignStaff_id: id },
      include,
    })

    if (!campaignStaff) {
      return NextResponse.json({ error: 'Campaign staff not found' }, { status: 404 })
    }

    return NextResponse.json(campaignStaff)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/campaign-staff/[id]
 * Update an existing campaign staff record
 * Body: { campaign_id?: number, orgStaff_id?: number, role?: string }
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

    const campaignStaff = await prisma.campaignStaff.update({
      where: { campaignStaff_id: id },
      data: body,
    })

    return NextResponse.json(campaignStaff)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/campaign-staff/[id]
 * Delete a campaign staff record
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

    await prisma.campaignStaff.delete({
      where: { campaignStaff_id: id },
    })

    return NextResponse.json({ message: 'Campaign staff deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
