import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { organizationStaffIncludes } from '@/lib/api-includes'

/**
 * GET /api/organization-staff/[id]
 * Get a single organization staff record by ID
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
      include = organizationStaffIncludes.basic
    } else if (includeParam === 'full') {
      include = organizationStaffIncludes.full
    }

    const organizationStaff = await prisma.organizationStaff.findUnique({
      where: { orgStaff_id: id },
      include,
    })

    if (!organizationStaff) {
      return NextResponse.json({ error: 'Organization staff not found' }, { status: 404 })
    }

    return NextResponse.json(organizationStaff)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/organization-staff/[id]
 * Update an existing organization staff record
 * Body: { org_id?: number, user_id?: number }
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

    const organizationStaff = await prisma.organizationStaff.update({
      where: { orgStaff_id: id },
      data: body,
    })

    return NextResponse.json(organizationStaff)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/organization-staff/[id]
 * Delete an organization staff record
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

    await prisma.organizationStaff.delete({
      where: { orgStaff_id: id },
    })

    return NextResponse.json({ message: 'Organization staff deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
