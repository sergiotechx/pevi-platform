import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { campaignIncludes } from '@/lib/api-includes'
import { createCampaignEscrow } from '@/lib/trustlesswork'

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
    const orgIdParam = searchParams.get('org_id')

    // Optional filter by organization
    const where = orgIdParam ? { org_id: parseInt(orgIdParam, 10) } : undefined

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = campaignIncludes.basic
    } else if (includeParam === 'full') {
      include = campaignIncludes.full
    }

    const campaigns = await prisma.campaign.findMany({
      where,
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
    const { wallet_address, ...campaignData } = body

    let campaign = await prisma.campaign.create({
      data: campaignData,
    })

    if (wallet_address) {
      try {
        const platformAddress = process.env.PEVI_PLATFORM_WALLET || wallet_address
        const escrow = await createCampaignEscrow({
          campaignId: campaign.campaign_id,
          amount: campaign.cost || 100,
          currency: "USDC",
          approver: wallet_address, // El usuario que crea la campaña es quien firma (signer)
          receiver: wallet_address,
          platformAddress: platformAddress, // La plataforma queda como admin/dispute resolver
          title: campaign.title,
          description: campaign.description || "Campaign Escrow",
        })

        if (escrow.contractId) {
          campaign = await prisma.campaign.update({
            where: { campaign_id: campaign.campaign_id },
            data: { escrowId: escrow.contractId },
          })
        } else if (escrow.unsignedTransaction) {
          // Si no tenemos contractId pero sí XDR, lo devolvemos al frontend para firmar
          return NextResponse.json({
            ...campaign,
            unsignedTransaction: escrow.unsignedTransaction
          }, { status: 201 })
        } else {
          await prisma.campaign.delete({ where: { campaign_id: campaign.campaign_id } })
          return NextResponse.json({ error: "No se pudo preparar el contrato de Trustless Work." }, { status: 400 })
        }
      } catch (escrowErr: any) {
        console.error("Failed to create campaign escrow:", escrowErr)
        await prisma.campaign.delete({ where: { campaign_id: campaign.campaign_id } })
        const errMsg = escrowErr?.message || escrowErr.toString()
        return NextResponse.json({ error: `Fallo al crear contrato en la red: ${errMsg}` }, { status: 400 })
      }
    }

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
