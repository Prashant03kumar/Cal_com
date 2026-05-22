import { Router } from "express";

import {
  listBookings,
  createBooking,
  cancelBooking,
} from "../controllers/bookingsController";

const router = Router();

// Use controller methods
router.get("/", listBookings);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
