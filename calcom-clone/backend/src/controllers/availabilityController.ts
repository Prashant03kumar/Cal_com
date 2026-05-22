import { Request, Response } from 'express'
import { asyncHandler, sendResponse } from '../utils'

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, {})
})

export const upsertAvailability = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, {})
})
