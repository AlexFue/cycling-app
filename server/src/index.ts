import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import * as userRoutes from './features/users/users.routes'
import * as authRoutes from './features/auth/auth.routes'
import { verifyServiceConnections } from './lib/verifyConnections'
import { verifyPrismaConnection } from './lib/prisma'
import { verifyRedisConnection } from './lib/redis'

// create an Express application
const app = express()

// global middleware
app.use(cors())
app.use(express.json())

app.get('/health', async (_req, res) => {
  try {
    await verifyPrismaConnection()
    await verifyRedisConnection()
    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(503).json({ status: 'unhealthy' })
  }
})

// routes
app.use('/api/users', userRoutes.default)
app.use('/api/auth', authRoutes.default)

// start the server after verifying connections to third party services
const startServer = async () => {
  await verifyServiceConnections()

  const PORT = process.env.PORT ?? 3000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Error starting server:', error)
  process.exit(1)
})
