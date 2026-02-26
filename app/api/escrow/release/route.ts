import { NextRequest, NextResponse } from "next/server"
import { changeMilestoneStatus, approveMilestone, releaseEscrow, sendTransaction, preparePayoutTx, submitStellarTransaction } from "@/lib/trustlesswork"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const { escrow_id, approver_public_key, step, signed_xdr } = await request.json()

        if (!escrow_id || !approver_public_key) {
            return NextResponse.json({ error: "Missing escrow_id or approver_public_key" }, { status: 400 })
        }

        // Step 1: change-milestone-status → service provider marks work as "Completed"
        // The corporation acts as both approver and service provider in this setup
        if (step === "change_status") {
            const result = await changeMilestoneStatus({
                escrowId: escrow_id,
                milestoneIndex: "0",
                newEvidence: "Evidence submitted by PEVI platform upon milestone approval",
                newStatus: "Completed",
                serviceProviderPublicKey: approver_public_key,
            })
            if (!result.unsignedTransaction) {
                return NextResponse.json({ error: "No unsignedTransaction returned from change-milestone-status" }, { status: 500 })
            }
            return NextResponse.json({ unsignedXdr: result.unsignedTransaction, step: "change_status" })
        }

        // Step 1b: Submit signed change-milestone-status XDR
        if (step === "submit_change") {
            if (!signed_xdr) return NextResponse.json({ error: "Missing signed_xdr" }, { status: 400 })
            await sendTransaction(signed_xdr)
            return NextResponse.json({ ok: true, step: "submit_change" })
        }

        // Step 2: approve-milestone → approver marks milestone as approved
        if (step === "approve") {
            try {
                const result = await approveMilestone({
                    escrowId: escrow_id,
                    milestoneIndex: "0",
                    approverPublicKey: approver_public_key,
                })
                if (!result.unsignedTransaction) {
                    return NextResponse.json({ error: "No unsignedTransaction returned from approve-milestone" }, { status: 500 })
                }
                return NextResponse.json({ unsignedXdr: result.unsignedTransaction, step: "approve" })
            } catch (approveError: any) {
                // If already approved, skip to release
                if (approveError.message?.includes("already been approved")) {
                    return NextResponse.json({ alreadyApproved: true, step: "approve" })
                }
                throw approveError
            }
        }

        // Step 2b: Submit signed approve-milestone XDR
        if (step === "submit_approve") {
            if (!signed_xdr) return NextResponse.json({ error: "Missing signed_xdr" }, { status: 400 })
            await sendTransaction(signed_xdr)
            return NextResponse.json({ ok: true, step: "submit_approve" })
        }

        // Step 3: release-funds → releaseSigner triggers final payment
        if (step === "release") {
            const result = await releaseEscrow({
                escrowId: escrow_id,
                approverPublicKey: approver_public_key,
            })
            if (!result.unsignedTransaction) {
                return NextResponse.json({ error: "No XDR returned from release-funds" }, { status: 500 })
            }
            return NextResponse.json({ unsignedXdr: result.unsignedTransaction, step: "release" })
        }

        // Step 3b: Submit signed release-funds XDR
        if (step === "submit_release") {
            if (!signed_xdr) return NextResponse.json({ error: "Missing signed_xdr" }, { status: 400 })
            const result = await sendTransaction(signed_xdr)
            return NextResponse.json({ hash: result?.hash || result?.id || signed_xdr, step: "submit_release" })
        }

        // Step 4: prepare-payout → build transaction from corp to beneficiaries
        if (step === "prepare_payout") {
            const campaign = await prisma.campaign.findFirst({
                where: { escrowId: escrow_id }, // We use escrow_id to find the campaign
                include: { campaignBeneficiaries: { include: { user: true } } }
            })

            if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 })

            const activeBeneficiaries = (campaign.campaignBeneficiaries ?? []).filter((b: any) => b.status === "active")
            if (activeBeneficiaries.length === 0) {
                return NextResponse.json({ error: "No active beneficiaries found for payout" }, { status: 400 })
            }

            const totalAmount = campaign.cost || 0
            const amountPerBeneficiary = (totalAmount / activeBeneficiaries.length).toFixed(2)

            const payouts = activeBeneficiaries
                .filter((b: any) => b.user.walletAddress)
                .map((b: any) => ({
                    destination: b.user.walletAddress!,
                    amount: amountPerBeneficiary
                }))

            if (payouts.length === 0) {
                return NextResponse.json({ error: "None of the active beneficiaries have a linked wallet" }, { status: 400 })
            }

            const result = await preparePayoutTx({
                sourcePublicKey: approver_public_key,
                payouts,
                currency: "USDC"
            })

            return NextResponse.json({
                unsignedXdr: result.unsignedXdr,
                step: "prepare_payout",
                beneficiaryCount: payouts.length,
                amountPerBeneficiary
            })
        }

        // Step 4b: Submit final payout XDR
        if (step === "submit_payout") {
            if (!signed_xdr) return NextResponse.json({ error: "Missing signed_xdr" }, { status: 400 })
            const result = await submitStellarTransaction(signed_xdr)
            return NextResponse.json({ hash: result?.hash || result?.id || signed_xdr, step: "submit_payout" })
        }

        return NextResponse.json({ error: `Invalid step: ${step}` }, { status: 400 })
    } catch (error: any) {
        console.error("Error in escrow release route:", error)
        return NextResponse.json({ error: error.message || "Failed to release escrow" }, { status: 500 })
    }
}
