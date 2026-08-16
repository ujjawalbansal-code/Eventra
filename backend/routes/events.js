import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";
import { computeTrustScore } from "../utils/trustScore.js";

const router = Router();

function decorateEvent(event) {
  const ticketTypes = db.data.ticketTypes.filter((t) => t.eventId === event.id);
  const trust = computeTrustScore(event);
  const eventReviews = db.data.reviews.filter((r) => r.eventId === event.id);
  const avgRating = eventReviews.length
    ? eventReviews.reduce((s, r) => s + r.rating, 0) / eventReviews.length
    : event.avgRating || 0;
  return {
    ...event,
    avgRating,
    reviewCount: eventReviews.length,
    ticketTypes,
    minPrice: ticketTypes.length ? Math.min(...ticketTypes.map((t) => t.price)) : 0,
    trust,
  };
}

router.get("/", (req, res) => {
  const { category, q, maxPrice, sort } = req.query;
  let events = db.data.events.map(decorateEvent);

  if (category && category !== "All") {
    events = events.filter((e) => e.category === category);
  }
  if (q) {
    const needle = q.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(needle) ||
        e.description.toLowerCase().includes(needle) ||
        e.venue.toLowerCase().includes(needle)
    );
  }
  if (maxPrice) {
    events = events.filter((e) => e.minPrice <= Number(maxPrice));
  }
  if (sort === "price") events.sort((a, b) => a.minPrice - b.minPrice);
  else if (sort === "trust") events.sort((a, b) => b.trust.score - a.trust.score);
  else events.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({ events });
});

router.get("/categories", (req, res) => {
  const cats = [...new Set(db.data.events.map((e) => e.category))];
  res.json({ categories: cats });
});

router.get("/:id", (req, res) => {
  const event = db.data.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "This event could not be found." });
  const decorated = decorateEvent(event);
  const eventReviews = db.data.reviews
    .filter((r) => r.eventId === event.id)
    .slice(-5)
    .reverse();
  res.json({ event: decorated, reviews: eventReviews });
});

// Organizer: create event
router.post("/", requireAuth, async (req, res) => {
  const b = req.body;
  if (!b.title || !b.date || !b.venue) {
    return res.status(400).json({ error: "Title, date and venue are required." });
  }
  const event = {
    id: uuid(),
    title: b.title,
    description: b.description || "",
    category: b.category || "Other",
    image: b.image || `https://picsum.photos/seed/${encodeURIComponent(b.title)}/800/500`,
    venue: b.venue,
    location: b.location || "Gurugram, HR",
    lat: b.lat || 28.4595,
    lng: b.lng || 77.0266,
    distanceKm: b.distanceKm ?? Math.round(Math.random() * 15 + 1),
    date: b.date,
    time: b.time || "18:00",
    organizerId: req.userId,
    organizerName: b.organizerName || "New Organizer",
    organizerVerified: false,
    venueVerified: false,
    organizerPastEvents: 0,
    refundPolicy: b.refundPolicy ?? true,
    capacity: b.capacity || 100,
    createdAt: new Date().toISOString(),
  };
  db.data.events.push(event);

  const types = b.ticketTypes && b.ticketTypes.length
    ? b.ticketTypes
    : [{ name: "General", price: 299, capacity: event.capacity }];
  for (const t of types) {
    db.data.ticketTypes.push({
      id: uuid(),
      eventId: event.id,
      name: t.name,
      price: Number(t.price),
      capacity: Number(t.capacity),
      availableQuantity: Number(t.capacity),
      perks: t.perks || [],
    });
  }
  await db.write();
  res.status(201).json({ event: decorateEvent(event) });
});

router.put("/:id", requireAuth, async (req, res) => {
  const event = db.data.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "This event could not be found." });
  if (event.organizerId !== req.userId) {
    return res.status(403).json({ error: "Only the organizer can edit this event." });
  }
  Object.assign(event, req.body, { id: event.id, organizerId: event.organizerId });
  await db.write();
  res.json({ event: decorateEvent(event) });
});

router.post("/:id/verify", requireAuth, async (req, res) => {
  const event = db.data.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "This event could not be found." });
  event.organizerVerified = true;
  event.venueVerified = true;
  await db.write();
  res.json({ event: decorateEvent(event) });
});

// Organizer dashboard data
router.get("/organizer/:organizerId/events", requireAuth, (req, res) => {
  const events = db.data.events
    .filter((e) => e.organizerId === req.params.organizerId)
    .map((e) => {
      const decorated = decorateEvent(e);
      const bookings = db.data.bookings.filter(
        (b) => b.eventId === e.id && b.paymentStatus === "successful"
      );
      const attendees = bookings.length;
      const revenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
      return { ...decorated, attendeeCount: attendees, revenue };
    });
  res.json({ events });
});

router.get("/:id/bookings", requireAuth, (req, res) => {
  const event = db.data.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "This event could not be found." });
  if (event.organizerId !== req.userId) {
    return res.status(403).json({ error: "Only the organizer can view bookings." });
  }
  const bookings = db.data.bookings.filter((b) => b.eventId === event.id);
  const withUsers = bookings.map((b) => {
    const user = db.data.users.find((u) => u.id === b.userId);
    return { ...b, userName: user?.name, userEmail: user?.email };
  });
  res.json({ bookings: withUsers });
});

export default router;
