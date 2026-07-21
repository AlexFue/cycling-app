import { Request, Response } from 'express'
import * as authService from './auth.service'
import { Prisma, User } from '../../generated/prisma/client'
import { UserResponse } from 'shared'
import { redis } from '../../lib/redis'

export const loginHandler = async (req: Request, res: Response) => {
  // Validate the request body contains the required fields: email and password
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' })
  }
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  } else if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password must be strings' })
  }

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
  try {
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

    // Add the jti to Redis blocklist with TTL
    await redis.set(`blocklist:${jti}`, 'true', 'EX', ttl)

    return res.status(204).send() // No content response
  } catch (error) {
    console.error('Error logging out user:', error)
    return res.status(500).json({ error: 'Failed to log out user' })
  }
}
