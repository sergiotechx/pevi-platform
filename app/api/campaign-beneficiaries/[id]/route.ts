import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { campaignBeneficiaryIncludes } from '@/lib/api-includes'

/**
 * GET /api/campaign-beneficiaries/[id]
 * Get a single campaign beneficiary by ID
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
      include = campaignBeneficiaryIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignBeneficiaryIncludes.full
    }

    const campaignBeneficiary = await prisma.campaignBeneficiary.findUnique({
      where: { campaignBeneficiary_id: id },
      include,
    })

    if (!campaignBeneficiary) {
      return NextResponse.json({ error: 'Campaign beneficiary not found' }, { status: 404 })
    }

    return NextResponse.json(campaignBeneficiary)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/campaign-beneficiaries/[id]
 * Update an existing campaign beneficiary
 * Body: { campaign_id?: number, user_id?: number, status?: string }
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

    const campaignBeneficiary = await prisma.campaignBeneficiary.update({
      where: { campaignBeneficiary_id: id },
      data: body,
    })

    return NextResponse.json(campaignBeneficiary)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/campaign-beneficiaries/[id]
 * Delete a campaign beneficiary
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

    await prisma.campaignBeneficiary.delete({
      where: { campaignBeneficiary_id: id },
    })

    return NextResponse.json({ message: 'Campaign beneficiary deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
