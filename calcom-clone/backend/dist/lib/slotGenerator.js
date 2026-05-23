"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlots = generateSlots;
function timeToMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}
function minutesToTime(mins) {
    const h = Math.floor(mins / 60)
        .toString()
        .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return h + ":" + m;
}
function generateSlots(params) {
    const availabilityStart = timeToMinutes(params.availabilityStart);
    const availabilityEnd = timeToMinutes(params.availabilityEnd);
    const slots = [];
    let cursor = availabilityStart;
    while (cursor + params.durationMinutes <= availabilityEnd) {
        const slotStart = cursor;
        const slotEnd = cursor + params.durationMinutes;
        const hasOverlap = params.existingBookings
            .filter((booking) => booking.status === "confirmed")
            .some((booking) => slotStart < timeToMinutes(booking.endTime) &&
            slotEnd > timeToMinutes(booking.startTime));
        if (!hasOverlap) {
            slots.push(minutesToTime(slotStart));
        }
        cursor += params.durationMinutes;
        // to add buffer
        // cursor += durationMinutes + (params.bufferMinutes ?? 0); // ← bas yeh
    }
    return slots;
}
