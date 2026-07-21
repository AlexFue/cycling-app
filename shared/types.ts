export interface UserResponse {
  id: string
  username: string
  createdAt: Date
}

export interface TokenPayload {
  id: string
  username: string
  email: string
  jti: string
  exp: number
}
