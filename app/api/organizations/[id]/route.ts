import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { organizationIncludes } from '@/lib/api-includes'

/**
 * GET /api/organizations/[id]
 * Get a single organization by ID
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
      include = organizationIncludes.basic
    } else if (includeParam === 'full') {
      include = organizationIncludes.full
    }

    const organization = await prisma.organization.findUnique({
      where: { org_id: id },
      include,
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/organizations/[id]
 * Update an existing organization
 * Body: { name?: string, type?: string, country?: number }
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

    const organization = await prisma.organization.update({
      where: { org_id: id },
      data: body,
    })

    return NextResponse.json(organization)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization
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

    await prisma.organization.delete({
      where: { org_id: id },
    })

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
