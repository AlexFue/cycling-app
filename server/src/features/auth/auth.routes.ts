import { Router } from 'express'
import { loginHandler, logoutHandler } from './auth.controller'
import { requireAuth } from '../../middleware/requireAuth'

const router = Router()

router.post('/login', loginHandler)
router.post('/logout', requireAuth, logoutHandler)

export default router
