import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { db } from "../data/db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  const existing = db.data.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuid(),
    name,
    email,
    passwordHash,
    profileImage: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
    interests: [],
    location: "Gurugram, HR",
    homeLat: 28.4595,
    homeLng: 77.0266,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.data.users.find(
    (u) => u.email.toLowerCase() === (email || "").toLowerCase()
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.data.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});

router.put("/me", requireAuth, async (req, res) => {
  const user = db.data.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  const { name, interests, location, profileImage } = req.body;
  if (name) user.name = name;
  if (interests) user.interests = interests;
  if (location) user.location = location;
  if (profileImage) user.profileImage = profileImage;
  await db.write();
  res.json({ user: publicUser(user) });
});

export default router;
