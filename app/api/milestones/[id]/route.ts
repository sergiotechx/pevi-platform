import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, validateId } from '@/lib/api-utils'
import { milestoneIncludes } from '@/lib/api-includes'

/**
 * GET /api/milestones/[id]
 * Get a single milestone by ID
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
      include = milestoneIncludes.basic
    } else if (includeParam === 'full') {
      include = milestoneIncludes.full
    }

    const milestone = await prisma.milestone.findUnique({
      where: { milestone_id: id },
      include,
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    return NextResponse.json(milestone)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/milestones/[id]
 * Update an existing milestone
 * Body: { campaign_id?: number, name?: string, description?: string, due_at?: string, status?: string, total_amount?: number, currency?: string }
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

    const milestone = await prisma.milestone.update({
      where: { milestone_id: id },
      data: body,
    })

    return NextResponse.json(milestone)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/milestones/[id]
 * Delete a milestone
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

    await prisma.milestone.delete({
      where: { milestone_id: id },
    })

    return NextResponse.json({ message: 'Milestone deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
