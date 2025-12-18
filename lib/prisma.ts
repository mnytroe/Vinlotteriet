import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Parse DATABASE_URL to create libsql client
function getLibSqlClient() {
  // For Turso, we need to use TURSO_DATABASE_URL or parse from DATABASE_URL
  // Prisma schema validates DATABASE_URL as file:, but we override with adapter
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  if (!tursoUrl) {
    throw new Error('DATABASE_URL or TURSO_DATABASE_URL is not set')
  }

  // Check if it's a libsql:// URL (Turso) or file:// URL (local SQLite)
  if (tursoUrl.startsWith('libsql://')) {
    // Turso database - parse the full connection string
    try {
      // Parse libsql:// URL manually since it's not a standard protocol
      const urlWithoutProtocol = tursoUrl.replace('libsql://', 'https://')
      const urlObj = new URL(urlWithoutProtocol)
      const authToken = urlObj.searchParams.get('authToken')
      
      // Reconstruct the libsql URL without query params
      const dbUrl = `libsql://${urlObj.host}${urlObj.pathname}`
      
      const client = createClient({
        url: dbUrl,
        authToken: authToken || undefined,
      })
      return new PrismaLibSQL(client)
    } catch (error) {
      console.error('Error parsing DATABASE_URL:', error)
      // Fallback to default PrismaClient
      return undefined
    }
  } else if (tursoUrl.startsWith('file:')) {
    // Local SQLite - use default PrismaClient (no adapter needed)
    return undefined
  } else {
    // Unknown format, try default
    return undefined
  }
}

const adapter = getLibSqlClient()

export const prisma = globalForPrisma.prisma ?? new PrismaClient(adapter ? { adapter } : undefined)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
