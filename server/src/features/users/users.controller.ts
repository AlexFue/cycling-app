import { Request, Response } from 'express'
import * as userService from './users.service'
import * as authService from '../auth/auth.service'
import { Prisma, User } from '../../generated/prisma/client'
import { AuthResponse, signUpSchema, UserResponse } from 'shared'
import { AuthErrorResponse } from '../../types/types'

/**
 * Creates a new user
 * @param req
 * @param res
 * @returns status 201 with the created user and JWT token, or an error message with the appropriate status code
 *
 */
export const createUserHandler = async (
  req: Request,
  res: Response<AuthResponse | AuthErrorResponse>
) => {
  const result = signUpSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }
  const { username, email, password } = result.data

  try {
    // Validate username is unique
    const existingUser = await userService.getUserByUsername(username)
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' })
    }

    // Validate email is unique
    const existingEmail = await userService.getUserByEmail(email)
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    // All validations passed, create the user
    const user: User = await userService.createUser({
      username,
      email,
      password,
    })
    const responseUser: UserResponse = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    }
    // Return the created user with a 201 status code and JWT token
    return res.status(201).json({
      user: responseUser,
      token: authService.generateToken(user),
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      console.error('Unique constraint violation:', error.meta)
      const target = error.meta?.target as string[] | undefined

      // check for existing username / email again b/c of race condition. DB's unique constraint catches it
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
