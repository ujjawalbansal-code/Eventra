import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";
import { squadMatchScore } from "../utils/matchScore.js";
import { computeTrustScore } from "../utils/trustScore.js";

const router = Router();

function decorateSquad(squad) {
  const memberRows = db.data.squadMembers.filter((m) => m.squadId === squad.id);
  const members = memberRows.map((m) => {
    const user = db.data.users.find((u) => u.id === m.userId);
    return { ...user, passwordHash: undefined, status: m.status };
  });
  const event = squad.eventId ? db.data.events.find((e) => e.id === squad.eventId) : null;
  const tickets = squad.eventId
    ? db.data.tickets.filter(
        (t) => t.eventId === squad.eventId && members.some((m) => m.id === t.attendeeId)
      )
    : [];
  const meetingPoint = db.data.meetingPoints.find((mp) => mp.squadId === squad.id);
  const plan = db.data.outingPlans.find((p) => p.squadId === squad.id);
  return { ...squad, members, event, tickets, meetingPoint, plan };
}

router.get("/mine", requireAuth, (req, res) => {
  const myMemberships = db.data.squadMembers.filter((m) => m.userId === req.userId);
  const squads = myMemberships
    .map((m) => db.data.squads.find((s) => s.id === m.squadId))
    .filter(Boolean)
    .map(decorateSquad);
  res.json({ squads });
});

router.post("/", requireAuth, async (req, res) => {
  const { name, eventId } = req.body;
  if (!name) return res.status(400).json({ error: "Give your squad a name to continue." });
  const squad = {
    id: uuid(),
    name,
    creatorId: req.userId,
    eventId: eventId || null,
    createdAt: new Date().toISOString(),
  };
  db.data.squads.push(squad);
  db.data.squadMembers.push({
    id: uuid(),
    squadId: squad.id,
    userId: req.userId,
    status: "accepted",
  });
  await db.write();
  res.status(201).json({ squad: decorateSquad(squad) });
});

router.get("/:id", requireAuth, (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.id);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  res.json({ squad: decorateSquad(squad) });
});

router.put("/:id", requireAuth, async (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.id);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  if (req.body.eventId !== undefined) squad.eventId = req.body.eventId;
  if (req.body.name) squad.name = req.body.name;
  await db.write();
  res.json({ squad: decorateSquad(squad) });
});

// Invite by email. For the demo, invited existing users are auto-accepted;
// unknown emails create a lightweight placeholder account.
router.post("/:id/members", requireAuth, async (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.id);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Enter an email to invite someone." });

  let user = db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: uuid(),
      name: name || email.split("@")[0],
      email,
      passwordHash: null,
      profileImage: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(email)}`,
      interests: [],
      location: "Gurugram, HR",
      homeLat: 28.4595 + (Math.random() - 0.5) * 0.08,
      homeLng: 77.0266 + (Math.random() - 0.5) * 0.08,
      createdAt: new Date().toISOString(),
    };
    db.data.users.push(user);
  }
  const already = db.data.squadMembers.find(
    (m) => m.squadId === squad.id && m.userId === user.id
  );
  if (already) return res.status(409).json({ error: "This person is already in the squad." });

  db.data.squadMembers.push({
    id: uuid(),
    squadId: squad.id,
    userId: user.id,
    status: "accepted",
  });
  await db.write();
  res.status(201).json({ squad: decorateSquad(squad) });
});

router.delete("/:id/members/:userId", requireAuth, async (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.id);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  db.data.squadMembers = db.data.squadMembers.filter(
    (m) => !(m.squadId === squad.id && m.userId === req.params.userId)
  );
  await db.write();
  res.json({ squad: decorateSquad(squad) });
});

// "Find Something For Our Squad" - ranked event recommendations
router.get("/:id/recommendations", requireAuth, (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.id);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  const memberRows = db.data.squadMembers.filter((m) => m.squadId === squad.id);
  const members = memberRows
    .map((m) => db.data.users.find((u) => u.id === m.userId))
    .filter(Boolean);
  const avgBudget = 600; // demo default; could be collected from members

  const ranked = db.data.events
    .map((event) => {
      const trust = computeTrustScore(event);
      const ticketTypes = db.data.ticketTypes.filter((t) => t.eventId === event.id);
      const minPrice = ticketTypes.length ? Math.min(...ticketTypes.map((t) => t.price)) : 0;
      const enriched = { ...event, trustScore: trust.score, minPrice };
      const match = squadMatchScore(enriched, members, avgBudget);
      return { event: { ...enriched, trust }, match };
    })
    .sort((a, b) => b.match.percent - a.match.percent)
    .slice(0, 6);

  res.json({ recommendations: ranked, squadBudget: avgBudget, memberCount: members.length });
});

export default router;
