import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'

/**
 * PUT /api/donations/[id]
 * Update a donation (e.g. set the finalized blockchain hash after signing)
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
        const { hash } = body

        if (!hash) {
            return NextResponse.json({ error: 'hash is required' }, { status: 400 })
        }

        const donation = await prisma.donation.update({
            where: { donation_id: id },
            data: { hash },
        })

        // Notify Organization
        try {
            const donorUser = await prisma.user.findUnique({
                where: { user_id: donation.user_id },
                select: { fullName: true }
            })

            const campaignData = await prisma.campaign.findUnique({
                where: { campaign_id: donation.campaign_id },
                include: {
                    organization: {
                        include: { organizationStaff: true }
                    }
                }
            })

            if (campaignData && campaignData.organization && campaignData.organization.organizationStaff) {
                const notifications = campaignData.organization.organizationStaff
                    .filter(staff => staff.user_id)
                    .map(staff => ({
                        user_id: staff.user_id!,
                        title: "notifications.newDonationTitle",
                        message: "notifications.newDonationMessage",
                        metadata: {
                            donor: donorUser?.fullName || "Un Inversor",
                            amount: parseFloat(String(donation.amount)),
                            campaign: campaignData.title
                        },
                        type: "wallet",
                        actionUrl: "/dashboard/payments",
                        actionLabel: "notifications.viewDonation"
                    }))

                if (notifications.length > 0) {
                    await prisma.notification.createMany({
                        data: notifications as any
                    })
                }
            }
        } catch (notifyErr) {
            console.error("Failed to notify corporation of donation:", notifyErr)
        }

        return NextResponse.json(donation, { status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}
