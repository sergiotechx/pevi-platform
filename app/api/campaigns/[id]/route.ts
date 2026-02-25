import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { campaignIncludes } from '@/lib/api-includes'
import { getEscrowByEngagementId } from '@/lib/trustlesswork'

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

/**
 * PATCH /api/campaigns/[id]
 * Sync escrow for this campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = validateId(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const engagementId = `campaign-${id}`
    console.log(`[SYNC-DEBUG] Syncing campaign ${id} with EngagementID: ${engagementId}`)
    const escrowData = await getEscrowByEngagementId(engagementId)
    console.log(`[SYNC-DEBUG] Escrow Data received:`, JSON.stringify(escrowData))

    if (escrowData && (escrowData.contractId || escrowData.escrowId || escrowData.id)) {
      const contractId = escrowData.contractId || escrowData.escrowId || escrowData.id
      console.log(`[SYNC-DEBUG] Found contractId: ${contractId}. Updating campaign ${id}`)
      const updated = await prisma.campaign.update({
        where: { campaign_id: id },
        data: { escrowId: contractId }
      })
      console.log(`[SYNC-DEBUG] Campaign ${id} updated successfully with escrowId ${contractId}`)
      return NextResponse.json({ success: true, escrowId: contractId })
    }

    console.log(`[SYNC-DEBUG] No contract found for EngagementID: ${engagementId}`)
    return NextResponse.json({
      error: "Contrato aún no encontrado en la red.",
      engagementId,
      details: escrowData // Send what we got from TW
    }, { status: 404 })
  } catch (error) {
    return handleApiError(error)
  }
}

