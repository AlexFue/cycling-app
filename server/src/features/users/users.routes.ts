import { Router } from 'express'
import { createUserHandler, getUserHandler } from './users.controller'
import { requireAuth } from '../../middleware/requireAuth'

const router = Router()

// sign up path
router.post('/', createUserHandler)
router.get('/:id', requireAuth, getUserHandler)

export default router
