import { z } from 'zod'

// Error types
export interface ErrorResponse {
  error: string
}

// User types
export const getUserParamsSchema = z.object({
  id: z.string().uuid('Invalid user id'),
})
