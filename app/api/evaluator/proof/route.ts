import { NextRequest, NextResponse } from "next/server"
import { Horizon, Networks, TransactionBuilder, Operation, Asset, Memo } from "@stellar/stellar-sdk"

export async function POST(request: NextRequest) {
    try {
        const { activity_id, evaluator_address } = await request.json()

        if (!activity_id || !evaluator_address) {
            return NextResponse.json({ error: "Missing activity_id or evaluator_address" }, { status: 400 })
        }

        const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"
        const horizonUrl = STELLAR_NETWORK === "mainnet"
            ? "https://horizon.stellar.org"
            : "https://horizon-testnet.stellar.org"
        const networkPassphrase = STELLAR_NETWORK === "mainnet"
            ? Networks.PUBLIC
            : Networks.TESTNET

        const server = new Horizon.Server(horizonUrl)
        const account = await server.loadAccount(evaluator_address)

        const platformWallet = process.env.PEVI_PLATFORM_WALLET || evaluator_address

        // We create a dummy transaction to the platform wallet with a memo
        const tx = new TransactionBuilder(account, {
            fee: "10000",
            networkPassphrase,
        })
            .addOperation(Operation.payment({
                destination: platformWallet,
                asset: Asset.native(),
                amount: "0.0000001" // 1 stroop of XLM
            }))
            .addMemo(Memo.text(`EVAL-OK-${activity_id}`.substring(0, 28))) // Max 28 bytes for Memo.text
            .setTimeout(300)
            .build()

        const xdr = tx.toXDR()

        return NextResponse.json({ xdr }, { status: 200 })
    } catch (error: any) {
        console.error("Error creating proof tx:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
