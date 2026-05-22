"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
exports.sendResponse = sendResponse;
exports.sendNoContent = sendNoContent;
class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
exports.ApiResponse = ApiResponse;
function sendResponse(res, statusCode, data) {
    return res.status(statusCode).json(data);
}
function sendNoContent(res) {
    return res.sendStatus(204);
}
