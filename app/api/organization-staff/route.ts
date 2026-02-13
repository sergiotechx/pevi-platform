import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, parsePagination } from '@/lib/api-utils'
import { organizationStaffIncludes } from '@/lib/api-includes'

/**
 * GET /api/organization-staff
 * Get all organization staff records with optional pagination and includes
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
      include = organizationStaffIncludes.basic
    } else if (includeParam === 'full') {
      include = organizationStaffIncludes.full
    }

    const organizationStaff = await prisma.organizationStaff.findMany({
      include,
      skip,
      take,
      orderBy: { orgStaff_id: 'desc' },
    })

    return NextResponse.json(organizationStaff)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/organization-staff
 * Create a new organization staff record
 * Body: { org_id: number, user_id: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const organizationStaff = await prisma.organizationStaff.create({
      data: body,
    })

    return NextResponse.json(organizationStaff, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
