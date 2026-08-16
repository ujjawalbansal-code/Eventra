// Eventra data layer
// -----------------------------------------------------------------------
// The build spec asks for MongoDB + Mongoose. This project uses a JSON-file
// document store (lowdb) with the exact same document shapes Mongoose
// models would have, so it runs anywhere with zero external services for
// the hackathon demo. Every collection below is a 1:1 stand-in for a
// Mongoose model (see /backend/models.md for the schema reference).
// Swapping in real MongoDB later only means changing this file.
// -----------------------------------------------------------------------
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "db.json");

const defaultData = {
  users: [],
  events: [],
  ticketTypes: [],
  seats: [],
  bookings: [],
  tickets: [],
  squads: [],
  squadMembers: [],
  meetingPoints: [],
  outingPlans: [],
  reviews: [],
};

export const db = await JSONFilePreset(file, defaultData);

export async function persist() {
  await db.write();
}
