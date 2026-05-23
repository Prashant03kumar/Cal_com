import express from "express";
import cors from "cors";
import eventTypesRouter from "./routes/eventTypes";
import availabilityRouter from "./routes/availability";
import slotsRouter from "./routes/slots";
import bookingsRouter from "./routes/bookings";
import publicRouter from "./routes/publicRoutes";
import { defaultUser } from "./middleware/defaultUser";
import { ApiError } from "./utils";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/event-types", defaultUser, eventTypesRouter); //done
app.use("/api/availability", defaultUser, availabilityRouter);
app.use("/api/bookings", defaultUser, bookingsRouter);
app.use("/api/slots", slotsRouter);
app.use("/api/public", publicRouter);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
