import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { userIncludes } from '@/lib/api-includes'

/**
 * GET /api/users
 * Get all users with optional pagination and includes
 * Query params: ?page=1&limit=10&include=basic|full
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, take } = parsePagination(searchParams)
    const includeParam = searchParams.get('include')

    // Determine include configuration
    let include = undefined
    if (includeParam === 'basic') {
      include = userIncludes.basic
    } else if (includeParam === 'full') {
      include = userIncludes.full
    }

    const users = await prisma.user.findMany({
      include,
      skip,
      take,
      orderBy: { user_id: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/users
 * Create a new user
 * Body: { fullName: string, email: string, role: string, password?: string, status?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const user = await prisma.user.create({
      data: body,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
