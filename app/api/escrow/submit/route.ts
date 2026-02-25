import { NextRequest, NextResponse } from 'next/server'
import { sendTransaction } from '@/lib/trustlesswork'

export async function POST(request: NextRequest) {
    try {
        const { signedXdr } = await request.json()
        if (!signedXdr) {
            return NextResponse.json({ error: "Signed XDR is required" }, { status: 400 })
        }

        const result = await sendTransaction(signedXdr)
        console.log(`[SUBMIT-DEBUG] Result:`, JSON.stringify(result))
        return NextResponse.json(result)
    } catch (error: any) {
        console.error(`Error in submit-transaction: ${error.message}`)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
