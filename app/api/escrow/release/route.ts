import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { releaseEscrow } from "@/lib/trustlesswork"

export async function POST(request: NextRequest) {
    try {
        const { escrow_id, award_id, approver_public_key } = await request.json()

        const { signedXdr } = await releaseEscrow({ escrowId: escrow_id, approverPublicKey: approver_public_key })

        return NextResponse.json({ hash: signedXdr }, { status: 200 })
    } catch (error) {
        console.error("Error releasing escrow:", error)
        return NextResponse.json({ error: "Failed to release escrow" }, { status: 500 })
    }
}
