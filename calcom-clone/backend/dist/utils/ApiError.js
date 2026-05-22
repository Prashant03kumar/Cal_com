"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message = 'Something went wrong', errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.ApiError = ApiError;
