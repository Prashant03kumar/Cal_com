"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlots = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const slotGenerator_1 = require("../lib/slotGenerator");
const utils_1 = require("../utils");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function isPastDate(date) {
    const requestedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return requestedDate < today;
}
// function to check is cutomer booking to early  it should be before 24 hours
function isTooSoon(date) {
    const requestedDate = new Date(date + "T00:00:00");
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 24); // 24 hours ahead
    return requestedDate < minDate;
}
function formatEventType(eventType) {
    return {
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        durationMinutes: eventType.durationMinutes,
        description: eventType.description,
    };
}
exports.getSlots = (0, utils_1.asyncHandler)(async (req, res) => {
    const date = req.query.date;
    if (!date) {
        throw new utils_1.ApiError(400, "date query param required. Format: YYYY-MM-DD");
    }
    if (!datePattern.test(date)) {
        throw new utils_1.ApiError(400, "Invalid date format");
    }
    if (isPastDate(date)) {
        throw new utils_1.ApiError(400, "Cannot book past dates");
    }
    // if (isTooSoon(date)) {
    //   throw new ApiError(400, "Book at least 24 hours in advance");
    // }
    const slug = req.params.slug;
    const eventType = await prisma_1.default.eventType.findUnique({ where: { slug } });
    if (!eventType || !eventType.isActive) {
        throw new utils_1.ApiError(404, "Event type not found");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { email: "alex@calcom.demo" },
    });
    if (!user) {
        throw new utils_1.ApiError(500, "Default user not found. Run seed first.");
    }
    const schedule = await prisma_1.default.availabilitySchedule.findFirst({
        where: { userId: user.id, isDefault: true },
        include: { rules: true },
    });
    if (!schedule) {
        throw new utils_1.ApiError(404, "No availability schedule found. Run seed.");
    }
    const dayOfWeek = new Date(date + "T00:00:00").getDay();
    const rule = schedule.rules.find((availabilityRule) => availabilityRule.dayOfWeek === dayOfWeek);
    const formattedEventType = formatEventType(eventType);
    if (!rule) {
        return (0, utils_1.sendResponse)(res, 200, { slots: [], eventType: formattedEventType });
    }
    const bookings = await prisma_1.default.booking.findMany({
        where: { eventTypeId: eventType.id, bookingDate: date },
    });
    const slots = (0, slotGenerator_1.generateSlots)({
        availabilityStart: rule.startTime,
        availabilityEnd: rule.endTime,
        durationMinutes: eventType.durationMinutes,
        existingBookings: bookings,
        // bufferMinutes: 15, // for buffer time
    });
    return (0, utils_1.sendResponse)(res, 200, { slots, eventType: formattedEventType });
});
