import { Request, Response } from 'express'
import { asyncHandler, sendResponse } from '../utils'

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, [])
})

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, {})
})

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, 200, {})
})
