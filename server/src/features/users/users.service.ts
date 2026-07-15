import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import { User } from '../../generated/prisma/client'

export const getUserByUsername = async (
  username: string
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { username },
  })
  return user
}

export const createUser = async (userData: {
  username: string
  password: string
  email: string
}): Promise<User> => {
  // hash the password before saving it to the database
  const passwordHash = await bcrypt.hash(userData.password, 10)

  // create the user in the database
  const user = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      passwordHash,
    },
  })
  return user
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return user
}
