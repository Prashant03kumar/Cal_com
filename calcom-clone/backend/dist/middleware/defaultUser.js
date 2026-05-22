"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUser = defaultUser;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function defaultUser(req, res, next) {
    const user = await prisma_1.default.user.findUnique({ where: { email: 'alex@calcom.demo' } });
    if (!user)
        return res.status(500).json({ error: 'Default user not found. Run seed first.' });
    req.user = user;
    next();
}
