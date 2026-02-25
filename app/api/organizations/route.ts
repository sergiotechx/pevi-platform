import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { organizationIncludes } from '@/lib/api-includes'

/**
 * GET /api/organizations
 * Get all organizations with optional pagination and includes
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
      include = organizationIncludes.basic
    } else if (includeParam === 'full') {
      include = organizationIncludes.full
    }

    const organizations = await prisma.organization.findMany({
      include,
      skip,
      take,
      orderBy: { org_id: 'desc' },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/organizations
 * Create a new organization and link the creator
 * Body: { name: string, type?: string, country?: number, user_id: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...orgData } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    // Generate a unique 6-character invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Find the platform verifier
    const platformVerifier = await prisma.user.findUnique({
      where: { email: 'plataforma@pevi.com' }
    })

    const staffConnect = [
      { user_id: parseInt(user_id, 10) }
    ]

    if (platformVerifier) {
      staffConnect.push({ user_id: platformVerifier.user_id })
    }

    const organization = await prisma.organization.create({
      data: {
        ...orgData,
        invite_code: inviteCode,
        organizationStaff: {
          create: staffConnect
        }
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
