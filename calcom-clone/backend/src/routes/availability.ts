import { Router } from 'express'
import { getAvailability, upsertAvailability } from '../controllers/availabilityController'

const router = Router()

router.get('/', getAvailability)
router.post('/', upsertAvailability)

export default router
