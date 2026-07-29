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

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: UserResponse
  token: string
}
