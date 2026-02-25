import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createEscrow } from "@/lib/trustlesswork"

export async function POST(request: NextRequest) {
    try {
        const { milestone_id, approver_address, beneficiary_address } = await request.json()

        const milestone = await prisma.milestone.findUniqueOrThrow({
            where: { milestone_id: parseInt(milestone_id) }
        })

        const escrow = await createEscrow({
            milestoneId: milestone.milestone_id,
            amount: milestone.total_amount ?? 0,
            currency: milestone.currency ?? "USDC",
            approver: approver_address,
            serviceProvider: beneficiary_address,
            platformAddress: process.env.PEVI_PLATFORM_WALLET || "",
            title: milestone.name || `Milestone ${milestone.milestone_id}`,
            description: milestone.description || `Escrow for milestone ${milestone.milestone_id}`
        })

        if (escrow.contractId) {
            await prisma.milestone.update({
                where: { milestone_id: milestone.milestone_id },
                data: { escrowId: escrow.contractId },
            })
        }

        return NextResponse.json(escrow, { status: 201 })
    } catch (error) {
        console.error("Error creating escrow:", error)
        return NextResponse.json({ error: "Failed to create escrow" }, { status: 500 })
    }
}
