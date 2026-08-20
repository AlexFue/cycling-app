import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth'
import { getTagsHandler } from './tags.controllers'

const router = Router()

router.get('/', requireAuth, getTagsHandler)

export default router
