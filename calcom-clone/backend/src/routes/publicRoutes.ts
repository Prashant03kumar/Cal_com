import { Router } from "express";
import prisma from "../lib/prisma";
import { sendResponse } from "../utils";

const router = Router();

// GET /event-types/:slug (public — no auth)
router.get("/event-types/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const eventType = await prisma.eventType.findFirst({
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
      return res
        .status(404)
        .json({ error: "Event type not found or inactive" });
    }
    return sendResponse(res, 200, eventType);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
