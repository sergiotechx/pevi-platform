import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient() {
  // Use a constrained connection pool to prevent exhausting Supabase Session mode limits.
  const pool = globalForPrisma.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 3, // Restrict maximum concurrent DB connections per instance
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  if (!globalForPrisma.pool) {
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
