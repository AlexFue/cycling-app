// features/auth/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { login } from '../auth.api'
import type { LoginRequest } from 'shared'

export const useLogin = () => {
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
  })
}
