import { Router } from 'express'
import { cancelBooking, createBooking, listBookings } from '../controllers/bookingsController'

const router = Router()

router.get('/', listBookings)
router.post('/', createBooking)
router.patch('/:id/cancel', cancelBooking)

export default router
