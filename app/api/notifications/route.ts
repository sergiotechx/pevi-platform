import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userIdParam = searchParams.get('user_id')
        console.log(`[API] GET /api/notifications - User ID: ${userIdParam}`)

        if (!userIdParam) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const userId = parseInt(userIdParam, 10)
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'invalid user_id' }, { status: 400 })
        }

        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { createdAt: 'desc' },
        })
        console.log(`[API] GET /api/notifications - Found ${notifications.length} notifications`)

        return NextResponse.json(notifications)
    } catch (error: any) {
        console.error('[API] GET /api/notifications Error:', error.message, error.stack)
        return handleApiError(error)
    }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.user_id || !body.title || !body.message || !body.type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const notification = await prisma.notification.create({
            data: {
                user_id: parseInt(body.user_id, 10),
                title: body.title,
                message: body.message,
                type: body.type,
                actionUrl: body.actionUrl || null,
                actionLabel: body.actionLabel || null,
            },
        })

        return NextResponse.json(notification, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}
