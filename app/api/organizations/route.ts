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
 * Create a new organization
 * Body: { name?: string, type?: string, country?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const organization = await prisma.organization.create({
      data: body,
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
