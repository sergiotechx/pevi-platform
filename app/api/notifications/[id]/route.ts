import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'

/**
 * PUT /api/notifications/[id]
 * Update a notification (mark as read)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params
        const id = validateId(rawId)
        if (!id) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const body = await request.json()

        const notification = await prisma.notification.update({
            where: { notification_id: id },
            data: body,
        })

        return NextResponse.json(notification)
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * DELETE /api/notifications/[id]
 * Delete/Dismiss a notification
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params
        const id = validateId(rawId)
        if (!id) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        await prisma.notification.delete({
            where: { notification_id: id },
        })

        return NextResponse.json({ message: 'Notification deleted' })
    } catch (error) {
        return handleApiError(error)
    }
}
