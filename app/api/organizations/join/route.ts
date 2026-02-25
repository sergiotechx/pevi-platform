import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

/**
 * POST /api/organizations/join
 * Join an organization via invite code
 * Body: { invite_code: string, user_id: number }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { invite_code, user_id } = body

        if (!invite_code || !user_id) {
            return NextResponse.json({ error: "invite_code and user_id are required" }, { status: 400 })
        }

        // 1. Find the organization by invite code
        const organization = await prisma.organization.findUnique({
            where: { invite_code },
        })

        if (!organization) {
            return NextResponse.json({ error: "Invalid invitation code" }, { status: 404 })
        }

        // 2. Check if already a member
        const existingStaff = await prisma.organizationStaff.findUnique({
            where: {
                org_id_user_id: {
                    org_id: organization.org_id,
                    user_id: parseInt(user_id, 10)
                }
            }
        })

        if (existingStaff) {
            return NextResponse.json({ error: "Already a member of this organization" }, { status: 409 })
        }

        // 3. Create the staff link
        const staff = await prisma.organizationStaff.create({
            data: {
                org_id: organization.org_id,
                user_id: parseInt(user_id, 10)
            }
        })

        return NextResponse.json({
            message: "Successfully joined the organization",
            organization: {
                org_id: organization.org_id,
                name: organization.name
            },
            staff
        }, { status: 201 })

    } catch (error) {
        return handleApiError(error)
    }
}
