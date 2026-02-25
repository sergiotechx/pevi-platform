import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { userIncludes } from '@/lib/api-includes'
import bcrypt from 'bcryptjs'

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
    console.log('[API] Received PUT body:', body)

    // Filter fields to avoid Prisma errors with unknown fields
    const allowedFields = ['fullName', 'email', 'password', 'role', 'status', 'walletAddress']
    const data: any = {}

    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        data[key] = body[key]
      }
    })

    if (data.walletAddress) {
      const existingUser = await prisma.user.findFirst({
        where: {
          walletAddress: data.walletAddress,
          user_id: { not: id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'wallet.alreadyLinked' },
          { status: 400 }
        )
      }
    }

    if (data.password) {
      if (typeof data.password !== 'string' || !data.password) {
        return NextResponse.json({ error: 'Invalid password format' }, { status: 400 })
      }
      console.log('[API] Hashing password for user:', id)
      try {
        data.password = await bcrypt.hash(data.password, 10)
      } catch (hashError) {
        console.error('[API] Bcrypt hash error:', hashError)
        return NextResponse.json({ error: 'Failed to process password' }, { status: 500 })
      }
    }

    console.log('[API] Final update data:', { ...data, password: data.password ? '[REDACTED]' : undefined })

    try {
      const user = await prisma.user.update({
        where: { user_id: id },
        data,
      })
      console.log('[API] User updated successfully:', id)
      return NextResponse.json(user)
    } catch (prismaError: any) {
      console.error('[API] Prisma update error:', prismaError)
      return NextResponse.json({
        error: 'Database update failed',
        details: prismaError.message,
        code: prismaError.code
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[API] PUT global error:', error)
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
