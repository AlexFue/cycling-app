import { Request, Response } from 'express'
import * as authService from './auth.service'
import { Prisma, User } from '../../generated/prisma/client'
import { AuthResponse, loginSchema, UserResponse } from 'shared'
import { redis } from '../../lib/redis'
import { ErrorResponse } from '../../types/types'

export const loginHandler = async (
  req: Request,
  res: Response<AuthResponse | ErrorResponse>
) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }
  const { email, password } = result.data

  try {
    const user: User = await authService.login(email, password)
    const token = authService.generateToken(user)
    const responseUser: UserResponse = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    }
    return res.status(200).json({ user: responseUser, token })
  } catch (error) {
    // Handle DB errors, credential errors, and other unexpected errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Database unreachable:', error)
      return res.status(503).json({ error: 'Service temporarily unavailable' })
    } else if (error instanceof authService.InvalidCredentialsError) {
      console.error('Invalid credentials:', error)
      return res.status(401).json({ error: error.message })
    } else {
      console.error('Error logging in user:', error)
      return res.status(500).json({ error: 'Failed to log in user' })
    }
  }
}

// Add the token's jti to the Redis blocklist with remaining TTL of token
export const logoutHandler = async (req: Request, res: Response) => {
  if (!req.user || !req.user.jti) {
    return res
      .status(400)
      .json({ error: 'Invalid request: missing token identifier' })
  }

  const jti = req.user.jti
  const exp = req.user.exp

  if (!exp) {
    return res
      .status(400)
      .json({ error: 'Invalid request: missing token expiration' })
  }

  const ttl = exp - Math.floor(Date.now() / 1000) // Calculate remaining TTL in seconds

  try {
    // Add the jti to Redis blocklist with TTL
    await redis.set(`blocklist:${jti}`, 'true', 'EX', ttl)

    return res.status(204).send() // No content response
  } catch (error) {
    console.error('Redis unreachable:', error)
    return res.status(503).json({ error: 'Service temporarily unavailable' })
  }
}
