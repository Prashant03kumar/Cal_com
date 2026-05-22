"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.createBooking = exports.listBookings = void 0;
const utils_1 = require("../utils");
exports.listBookings = (0, utils_1.asyncHandler)(async (req, res) => {
    return (0, utils_1.sendResponse)(res, 200, []);
});
exports.createBooking = (0, utils_1.asyncHandler)(async (req, res) => {
    return (0, utils_1.sendResponse)(res, 200, {});
});
exports.cancelBooking = (0, utils_1.asyncHandler)(async (req, res) => {
    return (0, utils_1.sendResponse)(res, 200, {});
});
