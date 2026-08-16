import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../data/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function autoGeneratePlan(event, meetTime) {
  const [h, m] = meetTime.split(":").map(Number);
  const add = (mins) => {
    const total = h * 60 + m + mins;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  return [
    { time: meetTime, emoji: "📍", label: `Meet at the meeting point` },
    { time: add(15), emoji: "🚶", label: "Walk to the venue" },
    { time: event.time || add(30), emoji: "🎟️", label: `${event.title} starts` },
    { time: add(210), emoji: "📸", label: "Group photo / free time" },
    { time: add(240), emoji: "🚕", label: "Head back" },
  ];
}

router.get("/:squadId", requireAuth, (req, res) => {
  const plan = db.data.outingPlans.find((p) => p.squadId === req.params.squadId);
  res.json({ plan: plan || null });
});

router.post("/:squadId/generate", requireAuth, async (req, res) => {
  const squad = db.data.squads.find((s) => s.id === req.params.squadId);
  if (!squad) return res.status(404).json({ error: "This squad could not be found." });
  const event = db.data.events.find((e) => e.id === squad.eventId);
  if (!event) return res.status(400).json({ error: "Attach an event to this squad first." });
  const meetTime = req.body.meetTime || "16:30";

  let plan = db.data.outingPlans.find((p) => p.squadId === squad.id);
  const steps = autoGeneratePlan(event, meetTime);
  if (!plan) {
    plan = { id: uuid(), squadId: squad.id, eventId: event.id, steps };
    db.data.outingPlans.push(plan);
  } else {
    plan.steps = steps;
  }
  await db.write();
  res.json({ plan });
});

router.put("/:squadId", requireAuth, async (req, res) => {
  const plan = db.data.outingPlans.find((p) => p.squadId === req.params.squadId);
  if (!plan) return res.status(404).json({ error: "No plan exists yet for this squad." });
  plan.steps = req.body.steps || plan.steps;
  await db.write();
  res.json({ plan });
});

export default router;
