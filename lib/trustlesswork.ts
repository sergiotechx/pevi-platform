const BASE_URL = process.env.TRUSTLESSWORK_BASE_URL!
const API_KEY = process.env.TRUSTLESSWORK_API_KEY!

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
}

export interface EscrowStatus {
    escrowId: string
    balance: number
    status: "pending" | "funded" | "released" | "disputed"
}

export async function createEscrow(params: {
    milestoneId: number
    amount: number
    currency: string
    approver: string
    serviceProvider: string
    platformAddress: string
    title: string
    description: string
}): Promise<{ contractId: string; signedXdr?: string }> {
    const payload = {
        signer: params.approver,
        engagementId: `milestone-${params.milestoneId}`,
        title: params.title || `Milestone ${params.milestoneId}`,
        description: params.description || `Escrow for milestone ${params.milestoneId}`,
        roles: {
            approver: params.approver,
            serviceProvider: params.serviceProvider,
            platformAddress: params.platformAddress,
            releaseSigner: params.approver,
            disputeResolver: params.platformAddress,
            receiver: params.serviceProvider
        },
        amount: params.amount,
        platformFee: 0,
        milestones: [{ description: params.description || `Escrow for milestone ${params.milestoneId}` }],
        trustline: { address: params.serviceProvider },
        receiverMemo: params.milestoneId
    }

    const res = await fetch(`${BASE_URL}/deployer/single-release`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Trustless Work createEscrow failed: ${res.statusText}`)
    return res.json()
}

export async function fundEscrow(params: {
    escrowId: string
    amount: number
    senderPublicKey: string
}): Promise<{ contractId?: string; signedXdr?: string }> {
    const res = await fetch(`${BASE_URL}/escrow/single-release/fund-escrow`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            escrowType: "single-release",
            contractId: params.escrowId,
            amount: params.amount,
            signer: params.senderPublicKey
        }),
    })
    if (!res.ok) throw new Error(`Trustless Work fundEscrow failed: ${res.statusText}`)
    return res.json()
}

export async function releaseEscrow(params: {
    escrowId: string
    approverPublicKey: string
}): Promise<{ contractId?: string; signedXdr?: string }> {
    const res = await fetch(`${BASE_URL}/escrow/single-release/release-funds`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            contractId: params.escrowId,
            releaseSigner: params.approverPublicKey
        }),
    })
    if (!res.ok) throw new Error(`Trustless Work releaseEscrow failed: ${res.statusText}`)
    return res.json()
}

export async function getEscrowStatus(escrowId: string): Promise<EscrowStatus> {
    const res = await fetch(`${BASE_URL}/escrow/${escrowId}`, { headers })
    if (!res.ok) throw new Error(`Trustless Work getEscrowStatus failed: ${res.statusText}`)
    return res.json()
}
