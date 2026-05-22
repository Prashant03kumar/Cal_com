import { Request, Response } from 'express'
import { asyncHandler, sendResponse } from '../utils'

export const getPublicEventType = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, {})
})
