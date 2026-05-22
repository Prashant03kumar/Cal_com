import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { ApiError, asyncHandler, sendNoContent, sendResponse } from '../utils'

const slugPattern = /^[a-z0-9-]+$/

function validateEventTypeInput(title: unknown, slug: unknown, durationMinutes: unknown) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Title is required'
  }

  if (typeof slug !== 'string' || slug.trim().length === 0) {
    return 'Slug is required'
  }

  if (!slugPattern.test(slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only'
  }

  const duration = Number(durationMinutes)
  if (!Number.isInteger(duration) || duration <= 0) {
    return 'Duration minutes must be a positive integer'
  }

  return null
}

export const listEventTypes = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user
  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return sendResponse(res, 200, eventTypes)
})

export const createEventType = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user
  const { title, slug, description, durationMinutes } = req.body
  const validationError = validateEventTypeInput(title, slug, durationMinutes)

  if (validationError) {
    throw new ApiError(400, validationError)
  }

  const existingEventType = await prisma.eventType.findUnique({ where: { slug } })
  if (existingEventType) {
    throw new ApiError(409, 'This slug is already taken. Choose a different one.')
  }

  const eventType = await prisma.eventType.create({
    data: {
      userId: user.id,
      title,
      slug,
      description: description || null,
      durationMinutes: Number(durationMinutes),
      isActive: true,
    },
  })

  return sendResponse(res, 201, eventType)
})

export const getEventType = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const eventType = await prisma.eventType.findUnique({ where: { id } })
  if (!eventType) {
    throw new ApiError(404, 'Event type not found')
  }

  return sendResponse(res, 200, eventType)
})

export const updateEventType = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { title, slug, description, durationMinutes, isActive } = req.body
  const validationError = validateEventTypeInput(title, slug, durationMinutes)

  if (validationError) {
    throw new ApiError(400, validationError)
  }

  const existingEventType = await prisma.eventType.findFirst({
    where: { slug, NOT: { id } },
  })
  if (existingEventType) {
    throw new ApiError(409, 'Slug already taken')
  }

  const eventType = await prisma.eventType.update({
    where: { id },
    data: {
      title,
      slug,
      description: description || null,
      durationMinutes: Number(durationMinutes),
      isActive: Boolean(isActive),
    },
  })

  return sendResponse(res, 200, eventType)
})

export const deleteEventType = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const eventType = await prisma.eventType.findUnique({ where: { id } })
  if (!eventType) {
    throw new ApiError(404, 'Event type not found')
  }

  await prisma.eventType.delete({ where: { id } })
  return sendNoContent(res)
})
