import { Request, Response } from 'express'
import { asyncHandler, sendResponse } from '../utils'

export const getSlots = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, { slots: [] })
})
