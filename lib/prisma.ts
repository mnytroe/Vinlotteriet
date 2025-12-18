import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Parse DATABASE_URL to create libsql client
function getLibSqlClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  // Check if it's a libsql:// URL (Turso) or file:// URL (local SQLite)
  if (url.startsWith('libsql://')) {
    // Turso database - parse the full connection string
    try {
      // Parse libsql:// URL manually since it's not a standard protocol
      const urlWithoutProtocol = url.replace('libsql://', 'https://')
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
  } else if (url.startsWith('file:')) {
    // Local SQLite - use default PrismaClient
    return undefined
  } else {
    // Unknown format, try default
    return undefined
  }
}

const adapter = getLibSqlClient()

export const prisma = globalForPrisma.prisma ?? new PrismaClient(adapter ? { adapter } : undefined)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
