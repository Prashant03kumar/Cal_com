"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.createBooking = exports.listBookings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const utils_1 = require("../utils");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;
function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}
function minutesToTime(m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function validateBookingInput(body) {
    const { eventTypeId, bookerName, bookerEmail, bookingDate, startTime } = body;
    if (!isNonEmptyString(eventTypeId)) {
        return 'eventTypeId is required';
    }
    if (!isNonEmptyString(bookerName)) {
        return 'bookerName is required';
    }
    if (!isNonEmptyString(bookerEmail)) {
        return 'bookerEmail is required';
    }
    if (!emailPattern.test(bookerEmail)) {
        return 'Invalid bookerEmail';
    }
    if (!isNonEmptyString(bookingDate)) {
        return 'bookingDate is required';
    }
    if (!datePattern.test(bookingDate)) {
        return 'Invalid bookingDate format';
    }
    if (!isNonEmptyString(startTime)) {
        return 'startTime is required';
    }
    if (!timePattern.test(startTime)) {
        return 'Invalid startTime format';
    }
    return null;
}
exports.listBookings = (0, utils_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const bookings = await prisma_1.default.booking.findMany({
        where: { eventType: { userId: user.id } },
        include: { eventType: { select: { id: true, title: true, slug: true, durationMinutes: true } } },
        orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
    });
    return (0, utils_1.sendResponse)(res, 200, bookings);
});
exports.createBooking = (0, utils_1.asyncHandler)(async (req, res) => {
    const { eventTypeId, bookerName, bookerEmail, bookingDate, startTime } = req.body;
    const validationError = validateBookingInput(req.body);
    if (validationError) {
        throw new utils_1.ApiError(400, validationError);
    }
    const eventType = await prisma_1.default.eventType.findUnique({ where: { id: eventTypeId } });
    if (!eventType) {
        throw new utils_1.ApiError(404, 'Event type not found');
    }
    const endMinutes = timeToMinutes(startTime) + eventType.durationMinutes;
    const endTime = minutesToTime(endMinutes);
    const conflict = await prisma_1.default.booking.findFirst({
        where: {
            eventTypeId,
            bookingDate,
            status: 'confirmed',
            AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } },
            ],
        },
    });
    if (conflict) {
        throw new utils_1.ApiError(409, 'This time slot is already booked. Please choose another time.');
    }
    const booking = await prisma_1.default.booking.create({
        data: {
            eventTypeId,
            bookerName,
            bookerEmail,
            bookingDate,
            startTime,
            endTime,
            status: 'confirmed',
        },
        include: { eventType: { select: { title: true, slug: true, durationMinutes: true } } },
    });
    return (0, utils_1.sendResponse)(res, 201, booking);
});
exports.cancelBooking = (0, utils_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const booking = await prisma_1.default.booking.findUnique({ where: { id } });
    if (!booking) {
        throw new utils_1.ApiError(404, 'Booking not found');
    }
    if (booking.status === 'cancelled') {
        throw new utils_1.ApiError(400, 'Booking is already cancelled');
    }
    const updatedBooking = await prisma_1.default.booking.update({
        where: { id },
        data: { status: 'cancelled', cancelReason: req.body.reason || null },
    });
    return (0, utils_1.sendResponse)(res, 200, updatedBooking);
});
