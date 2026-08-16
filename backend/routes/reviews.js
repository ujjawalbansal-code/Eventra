import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { eventId, rating, comment } = req.body;
  const event = db.data.events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: "This event could not be found." });
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }
  const user = db.data.users.find((u) => u.id === req.userId);
  const review = {
    id: uuid(),
    eventId,
    userId: req.userId,
    userName: user.name,
    rating,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };
  db.data.reviews.push(review);
  await db.write();
  res.status(201).json({ review });
});

export default router;
