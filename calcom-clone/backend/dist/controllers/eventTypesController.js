"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventType = exports.updateEventType = exports.getEventType = exports.createEventType = exports.listEventTypes = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const utils_1 = require("../utils");
const slugPattern = /^[a-z0-9-]+$/;
function validateEventTypeInput(title, slug, durationMinutes) {
    if (typeof title !== 'string' || title.trim().length === 0) {
        return 'Title is required';
    }
    if (typeof slug !== 'string' || slug.trim().length === 0) {
        return 'Slug is required';
    }
    if (!slugPattern.test(slug)) {
        return 'Slug must be lowercase letters, numbers, and hyphens only';
    }
    const duration = Number(durationMinutes);
    if (!Number.isInteger(duration) || duration <= 0) {
        return 'Duration minutes must be a positive integer';
    }
    return null;
}
exports.listEventTypes = (0, utils_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const eventTypes = await prisma_1.default.eventType.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });
    return (0, utils_1.sendResponse)(res, 200, eventTypes);
});
exports.createEventType = (0, utils_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { title, slug, description, durationMinutes } = req.body;
    const validationError = validateEventTypeInput(title, slug, durationMinutes);
    if (validationError) {
        throw new utils_1.ApiError(400, validationError);
    }
    const existingEventType = await prisma_1.default.eventType.findUnique({ where: { slug } });
    if (existingEventType) {
        throw new utils_1.ApiError(409, 'This slug is already taken. Choose a different one.');
    }
    const eventType = await prisma_1.default.eventType.create({
        data: {
            userId: user.id,
            title,
            slug,
            description: description || null,
            durationMinutes: Number(durationMinutes),
            isActive: true,
        },
    });
    return (0, utils_1.sendResponse)(res, 201, eventType);
});
exports.getEventType = (0, utils_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const eventType = await prisma_1.default.eventType.findUnique({ where: { id } });
    if (!eventType) {
        throw new utils_1.ApiError(404, 'Event type not found');
    }
    return (0, utils_1.sendResponse)(res, 200, eventType);
});
exports.updateEventType = (0, utils_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { title, slug, description, durationMinutes, isActive } = req.body;
    const validationError = validateEventTypeInput(title, slug, durationMinutes);
    if (validationError) {
        throw new utils_1.ApiError(400, validationError);
    }
    const existingEventType = await prisma_1.default.eventType.findFirst({
        where: { slug, NOT: { id } },
    });
    if (existingEventType) {
        throw new utils_1.ApiError(409, 'Slug already taken');
    }
    const eventType = await prisma_1.default.eventType.update({
        where: { id },
        data: {
            title,
            slug,
            description: description || null,
            durationMinutes: Number(durationMinutes),
            isActive: Boolean(isActive),
        },
    });
    return (0, utils_1.sendResponse)(res, 200, eventType);
});
exports.deleteEventType = (0, utils_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const eventType = await prisma_1.default.eventType.findUnique({ where: { id } });
    if (!eventType) {
        throw new utils_1.ApiError(404, 'Event type not found');
    }
    await prisma_1.default.eventType.delete({ where: { id } });
    return (0, utils_1.sendNoContent)(res);
});
