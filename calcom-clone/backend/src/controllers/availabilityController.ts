import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { ApiError, asyncHandler, sendResponse } from '../utils'

const timePattern = /^\d{2}:\d{2}$/

type AvailabilityRuleInput = {
  dayOfWeek: unknown
  startTime: unknown
  endTime: unknown
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function validateTime(time: unknown) {
  if (typeof time !== 'string' || !timePattern.test(time)) {
    return false
  }

  const [hours, minutes] = time.split(':').map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

function formatAvailability(schedule: any) {
  return {
    schedule: {
      id: schedule.id,
      name: schedule.name,
      timezone: schedule.timezone,
      isDefault: schedule.isDefault,
    },
    rules: schedule.rules.map((rule: any) => ({
      id: rule.id,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
    })),
  }
}

async function findDefaultSchedule(userId: string) {
  return prisma.availabilitySchedule.findFirst({
    where: { userId, isDefault: true },
    include: { rules: { orderBy: { dayOfWeek: 'asc' } } },
  })
}

function validateAvailabilityInput(timezone: unknown, rules: unknown) {
  if (typeof timezone !== 'string' || timezone.trim().length === 0) {
    return 'Timezone must be a non-empty string'
  }

  if (!Array.isArray(rules)) {
    return 'Rules must be an array'
  }

  for (const rule of rules as AvailabilityRuleInput[]) {
    if (!Number.isInteger(rule.dayOfWeek) || (rule.dayOfWeek as number) < 0 || (rule.dayOfWeek as number) > 6) {
      return 'dayOfWeek must be an integer between 0 and 6'
    }

    if (!validateTime(rule.startTime)) {
      return 'startTime must be a valid HH:mm time'
    }

    if (!validateTime(rule.endTime)) {
      return 'endTime must be a valid HH:mm time'
    }

    if (timeToMinutes(rule.startTime as string) >= timeToMinutes(rule.endTime as string)) {
      return 'startTime must be before endTime'
    }
  }

  return null
}

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user
  const schedule = await findDefaultSchedule(user.id)

  if (!schedule) {
    throw new ApiError(404, 'No availability schedule found. Run seed.')
  }

  return sendResponse(res, 200, formatAvailability(schedule))
})

export const upsertAvailability = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user
  const { timezone, rules } = req.body
  const validationError = validateAvailabilityInput(timezone, rules)

  if (validationError) {
    throw new ApiError(400, validationError)
  }

  const schedule = await findDefaultSchedule(user.id)
  if (!schedule) {
    throw new ApiError(404, 'No availability schedule found. Run seed.')
  }

  await prisma.$transaction([
    prisma.availabilitySchedule.update({
      where: { id: schedule.id },
      data: { timezone },
    }),
    prisma.availabilityRule.deleteMany({ where: { scheduleId: schedule.id } }),
    prisma.availabilityRule.createMany({
      data: rules.map((rule: AvailabilityRuleInput) => ({
        scheduleId: schedule.id,
        dayOfWeek: rule.dayOfWeek as number,
        startTime: rule.startTime as string,
        endTime: rule.endTime as string,
      })),
    }),
  ])

  const updatedSchedule = await findDefaultSchedule(user.id)
  if (!updatedSchedule) {
    throw new ApiError(404, 'No availability schedule found. Run seed.')
  }

  return sendResponse(res, 200, formatAvailability(updatedSchedule))
})
