import { Router } from 'express'
import {
  createEventType,
  deleteEventType,
  getEventType,
  listEventTypes,
  updateEventType,
} from '../controllers/eventTypesController'

const router = Router()

router.get('/', listEventTypes)
router.post('/', createEventType)
router.get('/:id', getEventType)
router.put('/:id', updateEventType)
router.delete('/:id', deleteEventType)

export default router
