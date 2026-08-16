# Eventra

**From finding an event to enjoying it together.**

Eventra turns event ticket booking into a full group-outing experience:
**Discover → Verify → Book → Squad → Share → Meet → Plan → Attend**

This is a complete, working full-stack app — not a mockup. Every button
described below actually works end to end.

---

## What's inside

- **`backend/`** — Node.js + Express REST API. JWT auth, mock payment
  gateway, QR ticket generation, trust-score engine, smart meetpoint
  algorithm, and squad-match recommendations.
- **`frontend/`** — React + Vite + Tailwind CSS. Clean, mobile-first UI
  covering the full user journey.

### About the database

The build brief asked for MongoDB + Mongoose. This project instead uses a
JSON-file document store (`backend/data/db.js`, powered by `lowdb`) with
**exactly the same document shapes** Mongoose models would use — see
`backend/models.md`. That means:

- Zero external services to install — it runs anywhere `node` runs.
- Swapping in real MongoDB later is a small, isolated change: turn each
  collection in `models.md` into a `mongoose.Schema` and replace the
  `db.data.<collection>.find()/.push()` calls in `backend/routes/*.js`
  with the equivalent Mongoose queries. No other architecture changes.

---

## Quick start

You'll need Node.js 18+ installed.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # edit JWT_SECRET if you like
npm run seed               # generates realistic demo data
npm start                  # runs on http://localhost:4000
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env       # points at the backend above by default
npm run dev                 # runs on http://localhost:5173
```

Open **http://localhost:5173**.

### Demo account

```
Email:    demo@eventra.com
Password: Demo@123
```

This account already has a populated squad ("TechFest Squad") with 4
members, 4 confirmed tickets, an accepted meeting point, and a generated
outing plan — so you can jump straight to the Squads tab and see the full
feature set without doing any setup.

---

## Suggested demo flow (3–5 minutes)

1. Open Eventra, browse **Discover**
2. Open an event → see the **Trust Score** and its breakdown
3. **Book Tickets** → pick a tier → review → demo payment → QR ticket generated
4. Go to **Squads** → open "TechFest Squad" (pre-seeded) or create a new one
5. Invite a friend by email, attach an event, see tickets assigned per member
6. **Suggest a meeting point** → accept it → see per-member travel times
7. **Generate an outing plan** → see the timeline from meet-up to heading home
8. Try **"Find something for our squad"** on a squad without an event yet,
   to see the squad-match recommendation score in action

There's also a "Simulate a failed payment (demo)" link on the payment
review step, and an **Organizer dashboard** (top nav) for creating and
verifying events.

---

## Project structure

```
eventra/
  backend/
    data/         # JSON store, seed script, schema reference (models.md)
    middleware/    # JWT auth
    routes/        # REST endpoints, one file per resource
    utils/         # trust score, smart meetpoint geo, squad-match scoring
    server.js
  frontend/
    src/
      api/         # single fetch client wrapping the backend
      context/     # auth + toast notifications
      components/  # shared UI (Button, Badge, EventCard, TrustRing, nav)
      pages/        # one file per screen
```

---

## Deploying it for real

This gives you a live URL instead of `localhost`. Two free services, ~15
minutes total. Push this project to a GitHub repo first (one repo, backend
and frontend as subfolders — both platforms below let you point at a
subfolder).

### 1. Backend → Render

1. Go to [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
2. **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add an environment variable: `JWT_SECRET` → any long random string.
   (Don't set `PORT` — Render sets it automatically and the app already reads `process.env.PORT`.)
6. Deploy. The app auto-seeds itself with demo data on first boot — no
   manual step needed.
7. Copy the URL Render gives you, e.g. `https://eventra-api.onrender.com`.

Note: Render's **free tier has an ephemeral filesystem** — data resets
whenever the service redeploys or restarts after being idle. That's fine
for a demo (it just re-seeds), but it means bookings/squads made by real
users won't persist long-term. For that, either upgrade to a Render disk,
or swap in real MongoDB (Atlas has a free tier) using `backend/models.md`
as the schema reference.

### 2. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → same GitHub repo.
2. **Root directory:** `frontend`
3. Framework preset: **Vite** (auto-detected)
4. Add an environment variable: `VITE_API_URL` → `https://eventra-api.onrender.com/api` (your Render URL + `/api`)
5. Deploy. Vercel gives you a URL like `https://eventra.vercel.app`.

That's it — open the Vercel URL and Eventra is live, talking to your Render backend.

---

## Security notes

- Passwords are hashed with bcrypt; never stored in plain text.
- JWT-based auth on every mutating endpoint (`middleware/auth.js`).
- No secrets are hardcoded — see `backend/.env.example`.
- The payment flow is clearly labeled as a demo gateway everywhere it
  appears in the UI; no real money or card data is ever processed.
