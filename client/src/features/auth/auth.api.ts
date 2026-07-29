// features/auth/auth.api.ts
import { apiClient } from '@/lib/apiClient'
import type { AuthResponse, LoginRequest, SignUpRequest } from 'shared'

export const login = (body: LoginRequest) =>
  apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const signUp = (body: SignUpRequest) =>
  apiClient<AuthResponse>('/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
