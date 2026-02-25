import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fundEscrow } from "@/lib/trustlesswork"

export async function POST(request: NextRequest) {
    try {
        const { escrow_id, amount, sender_public_key, donation_id } = await request.json()

        const { signedXdr } = await fundEscrow({ escrowId: escrow_id, amount, senderPublicKey: sender_public_key })

        if (donation_id && signedXdr) {
            await prisma.donation.update({
                where: { donation_id: parseInt(donation_id) },
                data: { hash: signedXdr },
            })
        }

        return NextResponse.json({ hash: signedXdr }, { status: 200 })
    } catch (error) {
        console.error("Error funding escrow:", error)
        return NextResponse.json({ error: "Failed to fund escrow" }, { status: 500 })
    }
}
