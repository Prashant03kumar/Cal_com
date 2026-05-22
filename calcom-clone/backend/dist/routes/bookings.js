"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingsController_1 = require("../controllers/bookingsController");
const router = (0, express_1.Router)();
// Use controller methods
router.get("/", bookingsController_1.listBookings);
router.post("/", bookingsController_1.createBooking);
router.patch("/:id/cancel", bookingsController_1.cancelBooking);
exports.default = router;
