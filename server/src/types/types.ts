import { z } from 'zod'

export interface ErrorResponse {
  error: string
}

export const getUserParamsSchema = z.object({
  id: z.string().uuid('Invalid user id'),
})
