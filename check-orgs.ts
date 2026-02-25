import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const orgs = await prisma.organization.findMany({
            take: 5
        })
        console.log('Organizations data:')
        console.log(JSON.stringify(orgs, null, 2))

        // Check type of org_id on first record
        if (orgs.length > 0) {
            console.log('Type of org_id:', typeof orgs[0].org_id)
        }
    } catch (error) {
        console.error('Error fetching organizations:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
