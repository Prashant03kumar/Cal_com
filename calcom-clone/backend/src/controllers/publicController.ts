import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { ApiError, asyncHandler, sendResponse } from '../utils'

export const getPublicEventType = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string
  const eventType = await prisma.eventType.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      durationMinutes: true,
    },
  })

  if (!eventType) {
    throw new ApiError(404, 'Event type not found or inactive')
  }

  return sendResponse(res, 200, eventType)
})
