import { verifyRedisConnection } from './redis'
import { verifyPrismaConnection } from './prisma'

export const verifyServiceConnections = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables')
    process.exit(1)
  }

  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL is not defined in environment variables')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables')
    process.exit(1)
  }
  try {
    await verifyPrismaConnection()
  } catch (error) {
    console.error('Database is not reachable:', error)
    process.exit(1)
  }
  try {
    await verifyRedisConnection()
  } catch (error) {
    console.error('Redis is not reachable:', error)
    process.exit(1)
  }
}
