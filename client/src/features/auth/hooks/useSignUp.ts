// features/auth/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import type { SignUpRequest } from 'shared'
import { signUp } from '../auth.api'

export const useLogin = () => {
  return useMutation({
    mutationFn: (body: SignUpRequest) => signUp(body),
  })
}
