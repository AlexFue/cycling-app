import Redis from 'ioredis'
import { MAX_REDIS_RETRIES } from '../constants'

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: MAX_REDIS_RETRIES,
}).on('error', (err) => {
  console.error('Redis connection error:', err)
})
