import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

/**
 * POST /api/auth/login
 * Authenticate user against database with bcrypt password comparison
 * Body: { email: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Map DB fields to frontend User shape (no password)
    return NextResponse.json({
      id: String(user.user_id),
      name: user.fullName,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress ?? undefined,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
