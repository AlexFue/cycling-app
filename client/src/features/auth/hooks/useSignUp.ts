// features/auth/useSignUp.ts
import { useMutation } from '@tanstack/react-query'
import type { SignUpRequest } from 'shared'
import { signUp } from '../auth.api'

export const useSignUp = () => {
  return useMutation({
    mutationFn: (body: SignUpRequest) => signUp(body),
  })
}
