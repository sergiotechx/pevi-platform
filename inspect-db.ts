import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('--- Inspecting Table Column Types ---')
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ORGANIZATION'
    `
        console.log(JSON.stringify(columns, null, 2))

        console.log('\n--- Inspecting Table Data ---')
        const data = await prisma.$queryRaw`
      SELECT * FROM "ORGANIZATION" LIMIT 10
    `
        console.log(JSON.stringify(data, null, 2))

    } catch (error) {
        console.error('Error inspecting database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
