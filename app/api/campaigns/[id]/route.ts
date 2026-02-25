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
    const { walletAddress, contractId: providedContractId } = await request.json().catch(() => ({ walletAddress: null, contractId: null }))
    const id = validateId(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const engagementId = `campaign-${id}`

    // If we already have the ID from submission, use it directly!
    if (providedContractId) {
      await prisma.campaign.update({
        where: { campaign_id: id },
        data: { escrowId: providedContractId }
      })
      return NextResponse.json({ success: true, escrowId: providedContractId })
    }

    // 1. Try primary engagementId
    let escrowData = await getEscrowByEngagementId(engagementId)

    // 2. Fallback: Try just the ID if campaign-ID fails
    if (!escrowData) {
      escrowData = await getEscrowByEngagementId(id.toString())
    }

    // 3. Ultra Fallback: If we have a walletAddress, search for escrows by signer
    if (!escrowData && walletAddress) {
      try {
        const BASE_URL = process.env.TRUSTLESSWORK_BASE_URL || 'https://dev.api.trustlesswork.com'
        const API_KEY = process.env.TRUSTLESSWORK_API_KEY
        const searchRes = await fetch(`${BASE_URL}/escrow?signer=${walletAddress}`, {
          headers: { "x-api-key": API_KEY! }
        })
        if (searchRes.ok) {
          const list = await searchRes.json()
          if (Array.isArray(list)) {
            const match = list.find((e: any) =>
              e.engagementId === engagementId || e.engagementId === id.toString()
            )
            if (match) escrowData = match
          }
        }
      } catch (e) {
        console.warn(`[SYNC] Search fallback failed:`, e)
      }
    }

    if (escrowData && (escrowData.contractId || escrowData.escrowId || escrowData.id)) {
      const contractId = escrowData.contractId || escrowData.escrowId || escrowData.id
      await prisma.campaign.update({
        where: { campaign_id: id },
        data: { escrowId: contractId }
      })
      return NextResponse.json({ success: true, escrowId: contractId })
    }

    return NextResponse.json({
      error: "Contrato aún no encontrado en la red.",
      engagementId
    }, { status: 404 })
  } catch (error) {
    return handleApiError(error)
  }
}

