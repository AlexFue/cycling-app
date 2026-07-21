import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { redis } from '../lib/redis'
import { TokenPayload } from 'shared'

/**
 * middleware function to verify jwt token is valid (not expired/ in redis blocklist)
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Authorization header missing or malformed' })
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET!

  let decoded: TokenPayload
  try {
    // Verify the token
    decoded = jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    console.error('Error verifying token:', error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  try {
    // Check if the token is blocklisted in Redis
    const isBlocklisted = await redis.get(`blocklist:${decoded.jti}`)
    if (isBlocklisted) {
      return res.status(401).json({ error: 'Token has been revoked' })
    }
  } catch (error) {
    console.error('Redis unreachable:', error)
    return res.status(503).json({ error: 'Service temporarily unavailable' })
  }

  req.user = decoded // Attach the decoded token payload to the request object
  next() // Proceed to the next middleware or route handler
}
