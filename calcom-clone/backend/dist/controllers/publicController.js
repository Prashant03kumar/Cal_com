"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicEventType = void 0;
const utils_1 = require("../utils");
exports.getPublicEventType = (0, utils_1.asyncHandler)(async (req, res) => {
    return (0, utils_1.sendResponse)(res, 200, {});
});
