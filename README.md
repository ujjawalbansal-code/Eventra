<div align="center">

# 🎟️ Eventra

**From finding an event to enjoying it together.**

Eventra turns event ticket booking into a complete group-outing experience —
not just *Discover → Book*, but **Discover → Verify → Book → Squad → Share → Meet → Plan → Attend.**

[![Live Demo](https://img.shields.io/badge/demo-live-6C56F0?style=for-the-badge)](https://your-app.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge)](https://your-api.onrender.com/api/health)
[![Node](https://img.shields.io/badge/node-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

</div>

---

## 🔗 Live Links

| | |
|---|---|
| 🌐 **App** | [your-app.vercel.app](https://your-app.vercel.app) |
| ⚙️ **API** | [your-api.onrender.com](https://your-api.onrender.com/api/health) |
| 🔑 **Demo login** | `demo@eventra.com` / `Demo@123` |

> The demo account comes pre-loaded with a squad, confirmed tickets, an
> accepted meeting point, and a generated outing plan — so you can see
> every feature without any setup.
>
> Note: the free-tier backend sleeps after inactivity — the first request
> may take 30–50 seconds to wake it up.

---

## 💡 The Problem

Booking tickets for college fests, concerts, comedy shows, and local events
usually means juggling multiple apps: one to discover events, another to
check if the organizer is legit, another to pay, and then WhatsApp to
figure out who's coming, who has which ticket, and where to meet. Planning
a fun outing ends up feeling like a chore.

**Eventra fixes that by handling the whole journey in one place.**

---

## ✨ Features

- 🛡️ **Event Trust Layer** — every event shows a live Trust Score (0–100)
  built from organizer verification, venue checks, refund policy, and
  attendee ratings, with a full breakdown of *why* it scored that way.
- 🎫 **Simple ticket selection** — clear tiers (General / Premium / VIP)
  with perks and live availability, no confusing seat maps.
- 💳 **Working booking flow** — select → review → demo payment → confirmed
  booking, with real inventory holds and release-on-failure logic.
- 📱 **Digital tickets with QR codes** — generated instantly on successful
  payment, reassignable to any squad member.
- 👥 **Squads** — create a group, invite friends by email, and see who has
  a ticket at a glance.
- 📍 **Smart MeetPoint** — a real distance-minimizing algorithm suggests
  the meeting spot that keeps everyone's combined travel time lowest.
- 🗓️ **Auto-generated outing plans** — a simple, editable timeline from
  meet-up to heading home.
- 🎯 **Squad Match** — a deterministic recommendation engine ranks events
  for a group based on shared interests, budget, and distance.
- 🧑‍💼 **Organizer dashboard** — create events, set ticket tiers, verify
  your organizer status, and track attendees and revenue.

---

## 🛠️ Tech Stack

**Frontend:** React · Vite · React Router · Tailwind CSS · Lucide Icons
**Backend:** Node.js · Express · JWT auth · bcrypt · QRCode
**Data:** JSON-file document store ([`lowdb`](https://github.com/typicode/lowdb)), structured 1:1 with Mongoose model shapes — see [`backend/models.md`](backend/models.md) — so it's a small, isolated change to swap in real MongoDB later.
**Deployed on:** Render (API) + Vercel (frontend)

---

## 🚀 Run it locally

Requires **Node.js 18+**. No database or external services to install.

```bash
# clone
git clone https://github.com/your-username/eventra.git
cd eventra

# backend
cd backend
npm install
cp .env.example .env
npm start              # auto-seeds demo data on first boot → localhost:4000

# frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev             # → localhost:5173
```

Log in with `demo@eventra.com` / `Demo@123`, or create a fresh account.

Full deployment instructions (Render + Vercel) are in
[`README.md`](README.md#deploying-it-for-real) inside the repo.

---

## 📁 Project Structure

```
eventra/
├── backend/
│   ├── data/          # JSON store, seed script, models.md (schema reference)
│   ├── middleware/     # JWT auth
│   ├── routes/         # REST endpoints — auth, events, bookings, tickets,
│   │                    # squads, meetpoint, plan, reviews
│   ├── utils/           # trust score engine, smart-meetpoint geo math,
│   │                    # squad-match scoring
│   └── server.js
└── frontend/
    └── src/
        ├── api/         # fetch client
        ├── context/      # auth + toast notifications
        ├── components/   # Button, Badge, EventCard, TrustRing, nav
        └── pages/         # Landing, Discover, EventDetails, BookingFlow,
                            # MyTickets, Squads, SquadDetail, Profile,
                            # OrganizerDashboard, CreateEvent
```

---

## 🎬 Demo Flow (3–5 min)

1. Open the app → browse **Discover**
2. Open an event → see the **Trust Score** breakdown
3. **Book Tickets** → pick a tier → review → demo payment → QR ticket generated
4. **Squads** → open the pre-seeded "TechFest Squad"
5. See tickets assigned per member, then **suggest & accept a meeting point**
6. **Generate the outing plan**
7. Create a new squad without an event → try **"Find something for our squad"**
   to see the squad-match score in action

---

## 🔒 Security

- Passwords hashed with bcrypt — never stored in plain text
- JWT-based auth on every mutating endpoint
- No hardcoded secrets — see `backend/.env.example`
- Payment flow is clearly labeled as a **demo gateway** everywhere it
  appears; no real money or card data is ever processed

---

<div align="center">

Built for a hackathon — from finding an event to actually going together, Eventra handles it all.

</div>
