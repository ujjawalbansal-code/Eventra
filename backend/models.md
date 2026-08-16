# Data model reference

This project stores data as JSON collections (see `data/db.js`) instead of
live MongoDB, so the hackathon demo runs with zero external services. Each
collection below is the exact shape a Mongoose model would use — swapping
in real MongoDB later means turning each of these into a `mongoose.Schema`
and replacing the array `.find()/.push()` calls in `routes/*.js` with the
equivalent Mongoose queries. No other architectural change is needed.

## User
id, name, email, passwordHash, profileImage, interests[], location,
homeLat, homeLng, createdAt

## Event
id, title, description, category, image, venue, location, lat, lng,
distanceKm, date, time, organizerId, organizerName, organizerVerified,
venueVerified, organizerPastEvents, refundPolicy, capacity, createdAt

## TicketType
id, eventId, name, price, capacity, availableQuantity, perks[]

## Booking
id, userId, eventId, items[{ ticketTypeId, quantity }], totalAmount,
paymentStatus (pending|successful|failed), bookingStatus
(pending|confirmed|cancelled), createdAt

## Ticket
id (human-readable, e.g. EVT-A1B2C3D4), bookingId, eventId, attendeeId,
attendeeName, ticketType, price, qrCode (data URL), ticketStatus, createdAt

## Squad
id, name, creatorId, eventId, createdAt

## SquadMember
id, squadId, userId, status

## MeetingPoint
id, squadId, location, lat, lng, legs[{ userId, name, minutes }], status

## OutingPlan
id, squadId, eventId, steps[{ time, emoji, label }]

## Review
id, eventId, userId, userName, rating, comment, createdAt
