import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '../users/users.service'
import { User } from '../../generated/prisma/client'
import { TOKEN_EXPIRATION } from '../../constants'

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    jti: crypto.randomUUID(), // Unique identifier for the token
  }
  const secret = process.env.JWT_SECRET!
  const token = jwt.sign(payload, secret, { expiresIn: TOKEN_EXPIRATION })
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
