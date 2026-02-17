import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { userIncludes } from '@/lib/api-includes'

/**
 * GET /api/users/[id]
 * Get a single user by ID
 * Query params: ?include=basic|full
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = validateId(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const includeParam = searchParams.get('include')

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = userIncludes.basic
    } else if (includeParam === 'full') {
      include = userIncludes.full
    }

    const user = await prisma.user.findUnique({
      where: { user_id: id },
      include,
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/users/[id]
 * Update an existing user
 * Body: { fullName?: string, email?: string, role?: string, password?: string, status?: string }
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

    const user = await prisma.user.update({
      where: { user_id: id },
      data: body,
    })

    return NextResponse.json(user)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
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

    await prisma.user.delete({
      where: { user_id: id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
