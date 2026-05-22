"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicEventType = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const utils_1 = require("../utils");
exports.getPublicEventType = (0, utils_1.asyncHandler)(async (req, res) => {
    const slug = req.params.slug;
    const eventType = await prisma_1.default.eventType.findFirst({
        where: { slug, isActive: true },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            durationMinutes: true,
        },
    });
    if (!eventType) {
        throw new utils_1.ApiError(404, 'Event type not found or inactive');
    }
    return (0, utils_1.sendResponse)(res, 200, eventType);
});
