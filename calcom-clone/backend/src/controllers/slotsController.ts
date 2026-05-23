import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { generateSlots } from "../lib/slotGenerator";
import { ApiError, asyncHandler, sendResponse } from "../utils";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isPastDate(date: string) {
  const requestedDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return requestedDate < today;
}
// function to check is cutomer booking to early  it should be before 24 hours
function isTooSoon(date: string) {
  const requestedDate = new Date(date + "T00:00:00");
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 24); // 24 hours ahead
  return requestedDate < minDate;
}

function formatEventType(eventType: {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  description: string | null;
}) {
  return {
    id: eventType.id,
    title: eventType.title,
    slug: eventType.slug,
    durationMinutes: eventType.durationMinutes,
    description: eventType.description,
  };
}

export const getSlots = asyncHandler(async (req: Request, res: Response) => {
  const date = req.query.date as string;
  if (!date) {
    throw new ApiError(400, "date query param required. Format: YYYY-MM-DD");
  }

  if (!datePattern.test(date)) {
    throw new ApiError(400, "Invalid date format");
  }

  if (isPastDate(date)) {
    throw new ApiError(400, "Cannot book past dates");
  }
  // if (isTooSoon(date)) {
  //   throw new ApiError(400, "Book at least 24 hours in advance");
  // }

  const slug = req.params.slug as string;
  const eventType = await prisma.eventType.findUnique({ where: { slug } });
  if (!eventType || !eventType.isActive) {
    throw new ApiError(404, "Event type not found");
  }

  const user = await prisma.user.findUnique({
    where: { email: "alex@calcom.demo" },
  });
  if (!user) {
    throw new ApiError(500, "Default user not found. Run seed first.");
  }

  const schedule = await prisma.availabilitySchedule.findFirst({
    where: { userId: user.id, isDefault: true },
    include: { rules: true },
  });
  if (!schedule) {
    throw new ApiError(404, "No availability schedule found. Run seed.");
  }

  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const rule = schedule.rules.find(
    (availabilityRule) => availabilityRule.dayOfWeek === dayOfWeek,
  );
  const formattedEventType = formatEventType(eventType);

  if (!rule) {
    return sendResponse(res, 200, { slots: [], eventType: formattedEventType });
  }

  const bookings = await prisma.booking.findMany({
    where: { eventTypeId: eventType.id, bookingDate: date },
  });

  const slots = generateSlots({
    availabilityStart: rule.startTime,
    availabilityEnd: rule.endTime,
    durationMinutes: eventType.durationMinutes,
    existingBookings: bookings,
    // bufferMinutes: 15, // for buffer time
  });

  return sendResponse(res, 200, { slots, eventType: formattedEventType });
});
