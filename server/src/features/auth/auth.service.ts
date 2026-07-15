import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '../users/users.service'
import { User } from '../../generated/prisma/client'

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  }
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  const token = jwt.sign(payload, secret, { expiresIn: '1h' })
  return token
}

export const login = async (email: string, password: string): Promise<User> => {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new InvalidCredentialsError('Username or password is incorrect')
  }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw new InvalidCredentialsError('Username or password is incorrect')
  }
  return user
}

export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCredentialsError'
  }
}
