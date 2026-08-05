// features/auth/auth.api.ts
import { apiClient } from '@/lib/apiClient'
import type { AuthResponse, LoginRequest, SignUpRequest } from 'shared'

/**
 * Logs in a user
 * @param body
 * @returns
 */
export const login = (body: LoginRequest) =>
  apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })

/**
 * Signs up a new user
 * @param body
 * @returns
 */
export const signUp = (body: SignUpRequest) =>
  apiClient<AuthResponse>('/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
