import { Router } from 'express'
import { createUserHandler } from './users.controller'

const router = Router()

// sign up path
router.post('/', createUserHandler)

export default router
