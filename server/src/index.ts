import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import * as userRoutes from './features/users/users.routes'
import * as authRoutes from './features/auth/auth.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables')
  process.exit(1)
}

if (!process.env.REDIS_URL) {
  console.error('REDIS_URL is not defined in environment variables')
  process.exit(1)
}

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

app.use('/api/users', userRoutes.default)
app.use('/api/auth', authRoutes.default)
