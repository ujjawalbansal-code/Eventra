import "dotenv/config";
import express from "express";
import cors from "cors";

import { db } from "./data/db.js";
import { seed } from "./data/seed.js";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";
import ticketRoutes from "./routes/tickets.js";
import squadRoutes from "./routes/squads.js";
import meetpointRoutes from "./routes/meetpoint.js";
import planRoutes from "./routes/plan.js";
import reviewRoutes from "./routes/reviews.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "eventra-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/squads", squadRoutes);
app.use("/api/meetpoint", meetpointRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/reviews", reviewRoutes);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ error: "This endpoint does not exist." });
});

// Central error handler - never leak internals
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end. Please try again." });
});

// Auto-seed on first boot (e.g. a fresh deploy with no data yet) so the
// app never starts empty and no manual `npm run seed` step is required
// on a hosting platform without shell access.
if (db.data.events.length === 0) {
  console.log("No data found — running first-time seed...");
  await seed();
}

app.listen(PORT, () => {
  console.log(`Eventra API running on http://localhost:${PORT}`);
});
