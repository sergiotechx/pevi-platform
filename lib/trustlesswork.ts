const BASE_URL = process.env.TRUSTLESSWORK_BASE_URL!
const API_KEY = process.env.TRUSTLESSWORK_API_KEY!

const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
}

const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"

const USDC_ISSUER = STELLAR_NETWORK === "mainnet"
    ? "GA5ZSEJYB37JRC5AVCIAZDL2Y4H6HDU7W56vWZHUXVCO3S5CZEBJY3FE"
    : "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"

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
}): Promise<{ contractId?: string; unsignedTransaction?: string; status?: string }> {
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
        trustline: {
            address: params.currency === "XLM" ? "native" : USDC_ISSUER,
            symbol: params.currency || "USDC"
        }
    }

    const res = await fetch(`${BASE_URL}/deployer/single-release`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Trustless Work createEscrow failed: ${res.statusText} - ${errorText}`)
    }
    return res.json()
}

export async function createCampaignEscrow(params: {
    campaignId: number
    amount: number
    currency: string
    approver: string
    receiver: string
    platformAddress: string
    title: string
    description: string
}): Promise<{ contractId?: string; unsignedTransaction?: string; status?: string }> {
    const payload = {
        signer: params.approver,
        engagementId: `campaign-${params.campaignId}`,
        title: params.title || `Campaign ${params.campaignId}`,
        description: params.description || `Escrow for campaign ${params.campaignId}`,
        roles: {
            approver: params.approver,
            serviceProvider: params.receiver,
            platformAddress: params.platformAddress,
            releaseSigner: params.approver,
            disputeResolver: params.platformAddress,
            receiver: params.receiver
        },
        amount: params.amount,
        platformFee: 0,
        milestones: [{ description: params.description || `Escrow for campaign ${params.campaignId}` }],
        trustline: {
            address: params.currency === "XLM" ? "native" : USDC_ISSUER,
            symbol: params.currency || "USDC"
        }
    }

    const res = await fetch(`${BASE_URL}/deployer/single-release`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Trustless Work createCampaignEscrow failed: ${res.statusText} - ${errorText}`)
    }
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
    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Trustless Work fundEscrow failed: ${res.statusText} - ${errorText}`)
    }
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
    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Trustless Work releaseEscrow failed: ${res.statusText} - ${errorText}`)
    }
    return res.json()
}

export async function getEscrowStatus(escrowId: string): Promise<EscrowStatus> {
    const res = await fetch(`${BASE_URL}/escrow/${escrowId}`, { headers })
    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Trustless Work getEscrowStatus failed: ${res.statusText} - ${errorText}`)
    }
    return res.json()
}
export async function getEscrowByEngagementId(engagementId: string): Promise<any> {
    console.log(`[TW-API] Fetching escrow for EngagementID: ${engagementId}`)
    const res = await fetch(`${BASE_URL}/escrow/engagement/${engagementId}`, { headers })
    if (!res.ok) {
        const errorText = await res.text()
        console.warn(`[TW-API] Failed to fetch escrow for ${engagementId}: ${res.status} ${errorText}`)
        return null
    }
    return res.json()
}
