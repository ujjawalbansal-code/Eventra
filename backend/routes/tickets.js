import { Router } from "express";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function decorateTicket(ticket) {
  const event = db.data.events.find((e) => e.id === ticket.eventId);
  return { ...ticket, event };
}

router.get("/", requireAuth, (req, res) => {
  const tickets = db.data.tickets
    .filter((t) => t.attendeeId === req.userId)
    .map(decorateTicket)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ tickets });
});

router.get("/:id", requireAuth, (req, res) => {
  const ticket = db.data.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "This ticket could not be verified." });
  res.json({ ticket: decorateTicket(ticket) });
});

// Reassign a ticket to another squad member (digital ticket sharing)
router.put("/:id/assign", requireAuth, async (req, res) => {
  const ticket = db.data.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "This ticket could not be verified." });
  const booking = db.data.bookings.find((b) => b.id === ticket.bookingId);
  if (!booking || booking.userId !== req.userId) {
    return res.status(403).json({ error: "Only the buyer can reassign this ticket." });
  }
  const { userId } = req.body;
  const target = db.data.users.find((u) => u.id === userId);
  if (!target) return res.status(404).json({ error: "That squad member could not be found." });
  ticket.attendeeId = target.id;
  ticket.attendeeName = target.name;
  await db.write();
  res.json({ ticket: decorateTicket(ticket) });
});

export default router;
