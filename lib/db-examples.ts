/**
 * Ejemplos de uso de Prisma ORM con la base de datos PEVI
 *
 * Importa el cliente de Prisma desde lib/prisma
 * y utiliza los métodos disponibles para interactuar con la base de datos
 */

import { prisma } from './prisma'

// ========================================
// EJEMPLOS DE CONSULTAS
// ========================================

/**
 * Crear una nueva organización
 */
export async function createOrganization(data: {
  name: string
  type?: string
  country?: number
}) {
  return await prisma.organization.create({
    data,
  })
}

/**
 * Obtener todas las organizaciones
 */
export async function getAllOrganizations() {
  return await prisma.organization.findMany()
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(data: {
  fullName: string
  email: string
  role: string
  password?: string
  status?: string
}) {
  return await prisma.user.create({
    data,
  })
}

/**
 * Buscar usuario por email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Crear una campaña con relaciones
 */
export async function createCampaign(data: {
  org_id: number
  title: string
  description?: string
  cost?: number
  start_at?: string
  status?: string
}) {
  return await prisma.campaign.create({
    data,
    include: {
      organization: true, // Incluir datos de la organización
    },
  })
}

/**
 * Obtener campañas con sus relaciones
 */
export async function getCampaignsWithDetails() {
  return await prisma.campaign.findMany({
    include: {
      organization: true,
      milestones: true,
      campaignBeneficiaries: {
        include: {
          user: true,
        },
      },
      campaignStaff: {
        include: {
          organizationStaff: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Crear un beneficiario de campaña
 */
export async function addBeneficiaryToCampaign(data: {
  campaign_id: number
  user_id: number
  status: string
}) {
  return await prisma.campaignBeneficiary.create({
    data,
  })
}

/**
 * Crear un milestone
 */
export async function createMilestone(data: {
  campaign_id: number
  name?: string
  description?: string
  due_at?: string
  status?: string
  total_amount?: number
  currency?: string
}) {
  return await prisma.milestone.create({
    data,
  })
}

/**
 * Obtener actividades de un beneficiario con detalles
 */
export async function getBeneficiaryActivities(campaignBeneficiary_id: number) {
  return await prisma.activity.findMany({
    where: { campaignBeneficiary_id },
    include: {
      milestone: true,
      campaignBeneficiary: {
        include: {
          user: true,
          campaign: true,
        },
      },
      award: true,
    },
  })
}

/**
 * Crear una actividad
 */
export async function createActivity(data: {
  milestone_id: number
  campaignBeneficiary_id: number
  activity_status?: string
  evidence_status?: string
  verification_status?: string
  evidence_ref?: string
  activity_observation?: string
  evaluation_note?: string
  verification_note?: string
}) {
  return await prisma.activity.create({
    data,
  })
}

/**
 * Crear un award (premio) para una actividad
 */
export async function createAward(data: {
  activity_id: number
  hash?: string
  status?: string
}) {
  return await prisma.award.create({
    data,
  })
}

// ========================================
// EJEMPLO DE USO EN UN API ROUTE
// ========================================

/*
// app/api/organizations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany()
    return NextResponse.json(organizations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener organizaciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const organization = await prisma.organization.create({
      data: body,
    })
    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear organización' },
      { status: 500 }
    )
  }
}
*/
