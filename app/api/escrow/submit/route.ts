import { NextRequest, NextResponse } from 'next/server'
import { sendTransaction } from '@/lib/trustlesswork'

export async function POST(request: NextRequest) {
    try {
        const { signedXdr } = await request.json()
        if (!signedXdr) {
            return NextResponse.json({ error: "Signed XDR is required" }, { status: 400 })
        }

        const result = await sendTransaction(signedXdr)
        console.log(`[SUBMIT-SUCCESS] Result:`, JSON.stringify(result))
        return NextResponse.json(result)
    } catch (error: any) {
        console.error(`[SUBMIT-ERROR] Error in submit-transaction:`, error)
        const errorMessage = error.response?.data?.message || error.message || "Unknown error during transaction submission"
        return NextResponse.json({ error: errorMessage, details: error.response?.data }, { status: 500 })
    }
}
