import { Router } from "express";
import { v4 as uuid } from "uuid";
import QRCode from "qrcode";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Step 1+2: create a pending booking (reserves ticket quantity)
router.post("/", requireAuth, async (req, res) => {
  const { eventId, items } = req.body; // items: [{ ticketTypeId, quantity }]
  const event = db.data.events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: "This event could not be found." });
  if (!items || !items.length) {
    return res.status(400).json({ error: "Select at least one ticket to continue." });
  }

  let total = 0;
  for (const item of items) {
    const type = db.data.ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!type) return res.status(404).json({ error: "Ticket type not found." });
    if (type.availableQuantity < item.quantity) {
      return res.status(409).json({
        error: `${type.name} is sold out or has fewer seats left than requested.`,
      });
    }
    total += type.price * item.quantity;
  }

  // Reserve stock immediately (released on failed/expired payment)
  for (const item of items) {
    const type = db.data.ticketTypes.find((t) => t.id === item.ticketTypeId);
    type.availableQuantity -= item.quantity;
  }

  const booking = {
    id: uuid(),
    userId: req.userId,
    eventId,
    items,
    totalAmount: total,
    paymentStatus: "pending",
    bookingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  db.data.bookings.push(booking);
  await db.write();
  res.status(201).json({ booking });
});

// Step 3: demo/mock payment. Clearly labeled as fake money movement.
router.post("/:id/pay", requireAuth, async (req, res) => {
  const booking = db.data.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  if (booking.userId !== req.userId) {
    return res.status(403).json({ error: "This booking doesn't belong to you." });
  }
  if (booking.paymentStatus !== "pending") {
    return res.status(409).json({ error: "This booking has already been processed." });
  }

  const { simulateFailure } = req.body;
  const event = db.data.events.find((e) => e.id === booking.eventId);
  const user = db.data.users.find((u) => u.id === req.userId);

  // Demo payment "gateway": succeeds unless the user explicitly triggers
  // the failure demo, or a random ~4% failure to feel realistic.
  const failed = simulateFailure === true || Math.random() < 0.04;

  if (failed) {
    booking.paymentStatus = "failed";
    booking.bookingStatus = "cancelled";
    // release reserved seats back to inventory
    for (const item of booking.items) {
      const type = db.data.ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (type) type.availableQuantity += item.quantity;
    }
    await db.write();
    return res.json({
      booking,
      message: "Payment failed. Your seats have been released.",
    });
  }

  booking.paymentStatus = "successful";
  booking.bookingStatus = "confirmed";

  // Generate one Ticket per unit purchased, default-assigned to the buyer.
  const newTickets = [];
  for (const item of booking.items) {
    const type = db.data.ticketTypes.find((t) => t.id === item.ticketTypeId);
    for (let i = 0; i < item.quantity; i++) {
      const ticketId = `EVT-${uuid().split("-")[0].toUpperCase()}`;
      const qrPayload = JSON.stringify({
        ticketId,
        eventId: event.id,
        bookingId: booking.id,
      });
      const qrCode = await QRCode.toDataURL(qrPayload, { margin: 1, width: 240 });
      const ticket = {
        id: ticketId,
        bookingId: booking.id,
        eventId: event.id,
        attendeeId: req.userId,
        attendeeName: user.name,
        ticketType: type.name,
        price: type.price,
        qrCode,
        ticketStatus: "valid",
        createdAt: new Date().toISOString(),
      };
      db.data.tickets.push(ticket);
      newTickets.push(ticket);
    }
  }

  event.organizerPastEvents = event.organizerPastEvents ?? 0;
  await db.write();
  res.json({ booking, tickets: newTickets, message: "Payment successful." });
});

router.get("/mine", requireAuth, (req, res) => {
  const bookings = db.data.bookings
    .filter((b) => b.userId === req.userId)
    .map((b) => {
      const event = db.data.events.find((e) => e.id === b.eventId);
      const tickets = db.data.tickets.filter((t) => t.bookingId === b.id);
      return { ...b, event, tickets };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings });
});

export default router;
