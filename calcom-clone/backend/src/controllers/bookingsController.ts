import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError, asyncHandler, sendResponse } from "../utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number) {
  return (
    String(Math.floor(m / 60)).padStart(2, "0") +
    ":" +
    String(m % 60).padStart(2, "0")
  );
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateBookingInput(body: any) {
  const { eventTypeId, bookerName, bookerEmail, bookingDate, startTime } = body;

  if (!isNonEmptyString(eventTypeId)) {
    return "eventTypeId is required";
  }

  if (!isNonEmptyString(bookerName)) {
    return "bookerName is required";
  }

  if (!isNonEmptyString(bookerEmail)) {
    return "bookerEmail is required";
  }

  if (!emailPattern.test(bookerEmail)) {
    return "Invalid bookerEmail";
  }

  if (!isNonEmptyString(bookingDate)) {
    return "bookingDate is required";
  }

  if (!datePattern.test(bookingDate)) {
    return "Invalid bookingDate format";
  }

  if (!isNonEmptyString(startTime)) {
    return "startTime is required";
  }

  if (!timePattern.test(startTime)) {
    return "Invalid startTime format";
  }

  return null;
}

export const listBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const bookings = await prisma.booking.findMany({
      where: { eventType: { userId: user.id } },
      include: {
        eventType: {
          select: { id: true, title: true, slug: true, durationMinutes: true },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "desc" }],
    });

    return sendResponse(res, 200, bookings);
  },
);

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventTypeId, bookerName, bookerEmail, bookingDate, startTime } =
      req.body;
    const validationError = validateBookingInput(req.body);

    if (validationError) {
      throw new ApiError(400, validationError);
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });
    if (!eventType) {
      throw new ApiError(404, "Event type not found");
    }
    // to limitize the booking
    // const dayBookingCount = await prisma.booking.count({
    //   where: {
    //     eventTypeId,
    //     bookingDate,
    //     status: "confirmed",
    //   },
    // });
    // if (dayBookingCount >= 5) {
    //   throw new ApiError(
    //     409,
    //     "This day is fully booked. Please choose another date.",
    //   );
    // }

    const endMinutes = timeToMinutes(startTime) + eventType.durationMinutes;
    const endTime = minutesToTime(endMinutes);
    const conflict = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        bookingDate,
        status: "confirmed",
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });

    if (conflict) {
      throw new ApiError(
        409,
        "This time slot is already booked. Please choose another time.",
      );
    }

    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        bookerName,
        bookerEmail,
        bookingDate,
        startTime,
        endTime,
        status: "confirmed",
      },
      include: {
        eventType: {
          select: { title: true, slug: true, durationMinutes: true },
        },
      },
    });

    return sendResponse(res, 201, booking);
  },
);

export const cancelBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.status === "cancelled") {
      throw new ApiError(400, "Booking is already cancelled");
    }
    // to mandate the reason for canceling the booking
    // if (!req.body.reason || req.body.reason.trim() === "") {
    //   throw new ApiError(400, "Cancellation reason is required");
    // }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled", cancelReason: req.body.reason || null },
    });

    return sendResponse(res, 200, updatedBooking);
  },
);
