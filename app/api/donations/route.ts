import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { fundEscrow } from '@/lib/trustlesswork'

/**
 * POST /api/donations
 * Create a new donation
 * Body: { user_id: number, campaign_id: number, amount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, campaign_id, amount } = body

    if (!user_id || !campaign_id || !amount) {
      return NextResponse.json(
        { error: 'user_id, campaign_id and amount are required' },
        { status: 400 }
      )
    }

    let donation = await prisma.donation.create({
      data: {
        user_id: parseInt(String(user_id)),
        campaign_id: parseInt(String(campaign_id)),
        amount: parseFloat(String(amount)),
        date: new Date(),
      },
    })

    let raw_xdr: string | undefined

    if (body.escrow_id && body.sender_public_key) {
      try {
        const fundResult = await fundEscrow({
          escrowId: body.escrow_id,
          amount: parseFloat(String(amount)),
          senderPublicKey: body.sender_public_key,
        })
        console.log("[DONATION] fundEscrow result:", JSON.stringify(fundResult))
        const xdr = fundResult.signedXdr || fundResult.unsignedTransaction
        if (xdr) {
          raw_xdr = xdr
        }
      } catch (escrowError: any) {
        console.error("[DONATION] Escrow fund failed:", escrowError.message)
        // Delete the orphan donation since escrow failed
        await prisma.donation.delete({ where: { donation_id: donation.donation_id } })
        return NextResponse.json(
          { error: escrowError.message || "Escrow fund failed" },
          { status: 400 }
        )
      }
    }

    if (raw_xdr) {
      return NextResponse.json({ ...donation, raw_xdr }, { status: 201 })
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/donations
 * Get all donations, optionally filtered by user_id or org_id
 * Query params: ?user_id=X or ?org_id=X
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('user_id')
    const orgIdParam = searchParams.get('org_id')

    const where: any = {}
    if (userIdParam) {
      where.user_id = parseInt(userIdParam)
    }
    if (orgIdParam) {
      where.campaign = { org_id: parseInt(orgIdParam) }
    }

    const donations = await prisma.donation.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { date: 'desc' },
      include: {
        campaign: { select: { title: true } },
        user: { select: { fullName: true } },
      },
    })
    return NextResponse.json(donations)
  } catch (error) {
    return handleApiError(error)
  }
}
