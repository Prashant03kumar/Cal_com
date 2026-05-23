"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const eventTypes_1 = __importDefault(require("./routes/eventTypes"));
const availability_1 = __importDefault(require("./routes/availability"));
const slots_1 = __importDefault(require("./routes/slots"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const defaultUser_1 = require("./middleware/defaultUser");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/event-types", defaultUser_1.defaultUser, eventTypes_1.default); //done
app.use("/api/availability", defaultUser_1.defaultUser, availability_1.default);
app.use("/api/bookings", defaultUser_1.defaultUser, bookings_1.default);
app.use("/api/slots", slots_1.default);
app.use("/api/public", publicRoutes_1.default);
app.use((err, req, res, next) => {
    if (err instanceof utils_1.ApiError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
exports.default = app;
