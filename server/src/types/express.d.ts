import { TokenPayload } from 'shared'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export {}
