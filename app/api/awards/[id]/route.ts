import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { awardIncludes } from '@/lib/api-includes'

/**
 * GET /api/awards/[id]
 * Get a single award by ID
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
      include = awardIncludes.basic
    } else if (includeParam === 'full') {
      include = awardIncludes.full
    }

    const award = await prisma.award.findUnique({
      where: { award_id: id },
      include,
    })

    if (!award) {
      return NextResponse.json({ error: 'Award not found' }, { status: 404 })
    }

    return NextResponse.json(award)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/awards/[id]
 * Update an existing award
 * Body: { activity_id?: number, hash?: string, status?: string }
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

    const award = await prisma.award.update({
      where: { award_id: id },
      data: body,
    })

    return NextResponse.json(award)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/awards/[id]
 * Delete an award
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

    await prisma.award.delete({
      where: { award_id: id },
    })

    return NextResponse.json({ message: 'Award deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
