import { Request, Response } from 'express'
import * as userService from './users.service'
import * as authService from '../auth/auth.service'
import { Prisma } from '../../generated/prisma/client'

/**
 * Creates a new user
 * @param req
 * @param res
 * @returns status 201 with the created user and JWT token, or an error message with the appropriate status code
 *
 */
export const createUserHandler = async (req: Request, res: Response) => {
  // Validate the request body contains the required fields: username, password, and email
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' })
  } else if (
    typeof req.body.username !== 'string' ||
    typeof req.body.password !== 'string' ||
    typeof req.body.email !== 'string'
  ) {
    return res
      .status(400)
      .json({ error: 'Username, password, and email must be strings' })
  } else if (!req.body.username || req.body.username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' })
  } else if (!req.body.password || req.body.password.trim() === '') {
    return res.status(400).json({ error: 'Password is required' })
  } else if (!req.body.email || req.body.email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Validate username is unique
    const existingUser = await userService.getUserByUsername(req.body.username)
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' })
    }

    // Validate email is unique
    const existingEmail = await userService.getUserByEmail(req.body.email)
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    // All validations passed, create the user
    const user = await userService.createUser(req.body)
    // Return the created user with a 201 status code and JWT token
    return res
      .status(201)
      .json({
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
        token: authService.generateToken(user),
      })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      console.error('Unique constraint violation:', error.meta)
      const target = error.meta?.target as string[] | undefined
      if (target?.includes('username')) {
        return res.status(409).json({ error: 'Username is already taken' })
      } else if (target?.includes('email')) {
        return res.status(409).json({ error: 'Email already in use' })
      } else {
        return res.status(500).json({ error: 'Failed to create user' })
      }
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Database unreachable:', error)
      return res.status(503).json({ error: 'Service temporarily unavailable' })
    } else {
      console.error('Error creating user:', error)
      return res.status(500).json({ error: 'Failed to create user' })
    }
  }
}
