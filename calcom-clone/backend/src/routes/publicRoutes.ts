import { Router } from 'express'
import { getPublicEventType } from '../controllers/publicController'

const router = Router()

router.get('/event-types/:slug', getPublicEventType)

export default router
