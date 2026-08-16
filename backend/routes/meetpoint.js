import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";
import { suggestMeetingPoint, CANDIDATE_MEETPOINTS } from "../utils/geo.js";

const router = Router();

// Suggest (does not persist) a meeting point based on member home locations
router.get("/:squadId/suggest", requireAuth, (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.squadId);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  const memberRows = db.data.squadMembers.filter((m) => m.squadId === squad.id);
  const locations = memberRows
    .map((m) => {
      const user = db.data.users.find((u) => u.id === m.userId);
      if (!user) return null;
      return { userId: user.id, name: user.name, lat: user.homeLat, lng: user.homeLng };
    })
    .filter(Boolean);

  if (locations.length === 0) {
    return res.status(400).json({ error: "Add squad members before suggesting a meetpoint." });
  }
  const best = suggestMeetingPoint(locations);
  res.json({ suggestion: best, alternatives: CANDIDATE_MEETPOINTS });
});

// Accept / persist a meeting point (either the suggestion or a manual choice)
router.post("/:squadId", requireAuth, async (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.squadId);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  const { location, lat, lng, legs } = req.body;
  if (!location) return res.status(400).json({ error: "Choose a meeting point to continue." });

  let mp = db.data.meetingPoints.find((m) => m.squadId === squad.id);
  if (!mp) {
    mp = { id: uuid(), squadId: squad.id };
    db.data.meetingPoints.push(mp);
  }
  Object.assign(mp, { location, lat, lng, legs: legs || [], status: "accepted" });
  await db.write();
  res.json({ meetingPoint: mp });
});

router.get("/:squadId", requireAuth, (req, res) => {
  const mp = db.data.meetingPoints.find((m) => m.squadId === req.params.squadId);
  res.json({ meetingPoint: mp || null });
});

export default router;
