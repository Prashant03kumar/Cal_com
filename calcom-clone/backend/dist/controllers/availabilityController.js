"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertAvailability = exports.getAvailability = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const utils_1 = require("../utils");
const timePattern = /^\d{2}:\d{2}$/;
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}
function validateTime(time) {
    if (typeof time !== "string" || !timePattern.test(time)) {
        return false;
    }
    const [hours, minutes] = time.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}
function formatAvailability(schedule) {
    return {
        schedule: {
            id: schedule.id,
            name: schedule.name,
            timezone: schedule.timezone,
            isDefault: schedule.isDefault,
        },
        rules: schedule.rules.map((rule) => ({
            id: rule.id,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
        })),
    };
}
async function findDefaultSchedule(userId) {
    return prisma_1.default.availabilitySchedule.findFirst({
        where: { userId, isDefault: true },
        include: { rules: { orderBy: { dayOfWeek: "asc" } } },
    });
}
function validateAvailabilityInput(timezone, rules) {
    if (typeof timezone !== "string" || timezone.trim().length === 0) {
        return "Timezone must be a non-empty string";
    }
    if (!Array.isArray(rules)) {
        return "Rules must be an array";
    }
    for (const rule of rules) {
        if (!Number.isInteger(rule.dayOfWeek) ||
            rule.dayOfWeek < 0 ||
            rule.dayOfWeek > 6) {
            return "dayOfWeek must be an integer between 0 and 6";
        }
        if (!validateTime(rule.startTime)) {
            return "startTime must be a valid HH:mm time";
        }
        if (!validateTime(rule.endTime)) {
            return "endTime must be a valid HH:mm time";
        }
        if (timeToMinutes(rule.startTime) >=
            timeToMinutes(rule.endTime)) {
            return "startTime must be before endTime";
        }
    }
    return null;
}
exports.getAvailability = (0, utils_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const schedule = await findDefaultSchedule(user.id);
    if (!schedule) {
        throw new utils_1.ApiError(404, "No availability schedule found. Run seed.");
    }
    return (0, utils_1.sendResponse)(res, 200, formatAvailability(schedule));
});
// why?
// User says:
// “My working hours changed”
// Old: 9 AM – 5 PM
// New: 10 AM – 4 PM
exports.upsertAvailability = (0, utils_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { timezone, rules } = req.body;
    const validationError = validateAvailabilityInput(timezone, rules);
    if (validationError) {
        throw new utils_1.ApiError(400, validationError);
    }
    const schedule = await findDefaultSchedule(user.id);
    if (!schedule) {
        throw new utils_1.ApiError(404, "No availability schedule found. Run seed.");
    }
    // All operations must succeed together OR fail together this is transaction means
    // A transaction = a group of database operations that run together as ONE unit
    await prisma_1.default.$transaction([
        prisma_1.default.availabilitySchedule.update({
            where: { id: schedule.id },
            data: { timezone },
        }),
        prisma_1.default.availabilityRule.deleteMany({
            where: { scheduleId: schedule.id },
        }),
        prisma_1.default.availabilityRule.createMany({
            data: rules.map((rule) => ({
                scheduleId: schedule.id,
                dayOfWeek: rule.dayOfWeek,
                startTime: rule.startTime,
                endTime: rule.endTime,
            })),
        }),
    ]);
    const updatedSchedule = await findDefaultSchedule(user.id);
    if (!updatedSchedule) {
        throw new utils_1.ApiError(404, "No availability schedule found. Run seed.");
    }
    return (0, utils_1.sendResponse)(res, 200, formatAvailability(updatedSchedule));
});
