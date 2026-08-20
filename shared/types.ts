import { z } from 'zod'

// User types
export interface UserResponse {
  id: string
  username: string
  createdAt: Date
}

export interface UserProfileResponse {
  user: UserResponse
}

// Auth types
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})
export type LoginRequest = z.infer<typeof loginSchema>

export const signUpSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})
export type SignUpRequest = z.infer<typeof signUpSchema>

export interface TokenPayload {
  id: string
  username: string
  email: string
  jti: string
  exp: number
}

export interface AuthResponse {
  user: UserResponse
  token: string
}
