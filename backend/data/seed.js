import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import QRCode from "qrcode";
import { db } from "./db.js";

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function seed() {
  db.data.users = [];
  db.data.events = [];
  db.data.ticketTypes = [];
  db.data.seats = [];
  db.data.bookings = [];
  db.data.tickets = [];
  db.data.squads = [];
  db.data.squadMembers = [];
  db.data.meetingPoints = [];
  db.data.outingPlans = [];
  db.data.reviews = [];

  // ---------- USERS ----------
  const demoPassHash = await bcrypt.hash("Demo@123", 10);
  const otherPassHash = await bcrypt.hash("Password@123", 10);

  const demoUser = {
    id: uuid(),
    name: "Ujjawal Sharma",
    email: "demo@eventra.com",
    passwordHash: demoPassHash,
    profileImage: "https://api.dicebear.com/7.x/notionists/svg?seed=Ujjawal",
    interests: ["Tech", "Music", "Comedy"],
    location: "Gurugram, HR",
    homeLat: 28.4595,
    homeLng: 77.0266,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(demoUser);

  const friendNames = [
    ["Rahul Verma", "Tech", "Gaming"],
    ["Aman Gupta", "Music", "Art"],
    ["Priya Nair", "Comedy", "Startups"],
    ["Sneha Kapoor", "Photography", "Music"],
  ];
  const friends = friendNames.map(([name, ...interests], i) => ({
    id: uuid(),
    name,
    email: `${name.split(" ")[0].toLowerCase()}@eventra.com`,
    passwordHash: otherPassHash,
    profileImage: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
    interests,
    location: "Gurugram, HR",
    homeLat: 28.4595 + (Math.random() - 0.5) * 0.09,
    homeLng: 77.0266 + (Math.random() - 0.5) * 0.09,
    createdAt: new Date().toISOString(),
  }));
  db.data.users.push(...friends);

  const organizers = [
    { name: "Pixel Fest Collective", verified: true, past: 12 },
    { name: "Aria Live Events", verified: true, past: 8 },
    { name: "LaughTrack Productions", verified: true, past: 5 },
    { name: "CodeCircuit Community", verified: true, past: 3 },
    { name: "Sundown Studios", verified: false, past: 0 },
    { name: "Campus Culture Council", verified: true, past: 6 },
  ];

  // ---------- EVENTS ----------
  const eventDefs = [
    {
      title: "TechFest 2026",
      category: "Tech",
      description:
        "A two-day college tech fest with hackathons, robotics demos, guest talks from industry engineers, and a startup expo. Grab your squad and build, compete, or just explore.",
      venue: "Amity Convention Centre",
      date: daysFromNow(9),
      time: "10:00",
      distanceKm: 6,
      organizer: organizers[3],
      tickets: [
        { name: "General", price: 399, capacity: 300, perks: ["Entry to all talks", "Expo access"] },
        { name: "Premium", price: 699, capacity: 100, perks: ["Front-row seating", "Workshop pass", "Swag kit"] },
        { name: "VIP", price: 999, capacity: 40, perks: ["Meet & greet", "Reserved lounge", "All-access badge"] },
      ],
    },
    {
      title: "Sundown Music Concert",
      category: "Music",
      description:
        "An open-air evening of live indie and fusion music featuring three rising bands, food trucks, and a chill lawn setup.",
      venue: "Skyline Amphitheatre",
      date: daysFromNow(5),
      time: "19:00",
      distanceKm: 9,
      organizer: organizers[1],
      tickets: [
        { name: "General Lawn", price: 599, capacity: 400, perks: ["Lawn seating"] },
        { name: "Premium Standing", price: 899, capacity: 150, perks: ["Closer to stage"] },
        { name: "VIP", price: 1499, capacity: 50, perks: ["Front barricade", "Artist meet & greet"] },
      ],
    },
    {
      title: "Laugh Riot: Stand-up Night",
      category: "Comedy",
      description:
        "A stand-up comedy showcase with four touring comedians riffing on college life, relationships, and everything in between.",
      venue: "The Habitat Comedy Club",
      date: daysFromNow(3),
      time: "20:00",
      distanceKm: 4,
      organizer: organizers[2],
      tickets: [
        { name: "General", price: 349, capacity: 120, perks: ["Standard seating"] },
        { name: "Premium", price: 599, capacity: 40, perks: ["Front rows", "1 free drink"] },
      ],
    },
    {
      title: "AI & Prompt Engineering Workshop",
      category: "Tech",
      description:
        "A hands-on half-day workshop covering practical prompt engineering, building small AI apps, and a live Q&A with an ML engineer.",
      venue: "WeWork Cyber Hub",
      date: daysFromNow(12),
      time: "11:00",
      distanceKm: 11,
      organizer: organizers[3],
      tickets: [
        { name: "General", price: 499, capacity: 80, perks: ["Materials included", "Certificate"] },
      ],
    },
    {
      title: "Frame & Focus Photography Walk",
      category: "Photography",
      description:
        "A guided photography walk through the old city with a professional photographer, followed by a portfolio review session.",
      venue: "Heritage Quarter Meet Point",
      date: daysFromNow(7),
      time: "07:00",
      distanceKm: 14,
      organizer: organizers[4],
      tickets: [
        { name: "General", price: 299, capacity: 30, perks: ["Guided walk", "Portfolio review"] },
      ],
    },
    {
      title: "Clash Arena: Campus Gaming Tournament",
      category: "Gaming",
      description:
        "A BGMI and Valorant campus tournament with squad-based brackets, live commentary, and a prize pool for the top teams.",
      venue: "Indoor Sports Complex",
      date: daysFromNow(15),
      time: "12:00",
      distanceKm: 3,
      organizer: organizers[5],
      tickets: [
        { name: "Player Entry", price: 199, capacity: 200, perks: ["Tournament entry"] },
        { name: "Spectator", price: 99, capacity: 300, perks: ["General viewing"] },
      ],
    },
    {
      title: "Canvas & Colour: Student Art Exhibition",
      category: "Art",
      description:
        "An exhibition of student and emerging artists' work, with live sketching booths and a small curated art sale.",
      venue: "City Art Gallery",
      date: daysFromNow(6),
      time: "16:00",
      distanceKm: 8,
      organizer: organizers[5],
      tickets: [{ name: "General", price: 0, capacity: 250, perks: ["Free entry"] }],
    },
    {
      title: "Founders' Circle: Startup Meetup",
      category: "Startups",
      description:
        "A casual networking meetup for early-stage founders and students interested in building startups, with two lightning talks.",
      venue: "91springboard Co-working",
      date: daysFromNow(4),
      time: "18:30",
      distanceKm: 5,
      organizer: organizers[1],
      tickets: [{ name: "General", price: 149, capacity: 90, perks: ["Networking", "Refreshments"] }],
    },
    {
      title: "Rangmanch: Cultural Fest",
      category: "Culture",
      description:
        "A vibrant cultural fest with dance battles, a fashion walk, food stalls, and a headline DJ set to close the night.",
      venue: "Central University Ground",
      date: daysFromNow(18),
      time: "15:00",
      distanceKm: 7,
      organizer: organizers[5],
      tickets: [
        { name: "General", price: 249, capacity: 500, perks: ["All-day access"] },
        { name: "Premium", price: 499, capacity: 150, perks: ["Reserved seating", "Backstage pass"] },
      ],
    },
    {
      title: "Open Mic Sundays",
      category: "Music",
      description:
        "A relaxed weekly open mic for poets, singers, and storytellers. First-timers welcome — sign up on the spot.",
      venue: "Brewhouse Cafe",
      date: daysFromNow(2),
      time: "19:30",
      distanceKm: 2,
      organizer: organizers[4],
      tickets: [{ name: "General", price: 99, capacity: 60, perks: ["Entry + 1 beverage"] }],
    },
    {
      title: "Beats & Bass: EDM Night",
      category: "Music",
      description:
        "A high-energy EDM night with two DJs, a laser show, and a dedicated dance floor.",
      venue: "Warehouse 21 Club",
      date: daysFromNow(10),
      time: "21:00",
      distanceKm: 13,
      organizer: organizers[0],
      tickets: [
        { name: "General", price: 799, capacity: 250, perks: ["Entry"] },
        { name: "VIP", price: 1799, capacity: 60, perks: ["VIP deck", "1 bottle service share"] },
      ],
    },
    {
      title: "Pixel Fest: Indie Game Showcase",
      category: "Gaming",
      description:
        "An indie game showcase with playable demo booths from student and indie studios, plus a dev panel.",
      venue: "Innovation Hub Auditorium",
      date: daysFromNow(20),
      time: "11:00",
      distanceKm: 6,
      organizer: organizers[0],
      tickets: [{ name: "General", price: 199, capacity: 200, perks: ["Demo access"] }],
    },
  ];

  for (const def of eventDefs) {
    const event = {
      id: uuid(),
      title: def.title,
      description: def.description,
      category: def.category,
      image: `https://picsum.photos/seed/${encodeURIComponent(def.title)}/900/560`,
      venue: def.venue,
      location: "Gurugram, HR",
      lat: 28.4595 + (Math.random() - 0.5) * 0.1,
      lng: 77.0266 + (Math.random() - 0.5) * 0.1,
      distanceKm: def.distanceKm,
      date: def.date,
      time: def.time,
      organizerId: uuid(),
      organizerName: def.organizer.name,
      organizerVerified: def.organizer.verified,
      venueVerified: def.organizer.verified,
      organizerPastEvents: def.organizer.past,
      refundPolicy: true,
      capacity: def.tickets.reduce((s, t) => s + t.capacity, 0),
      createdAt: new Date().toISOString(),
    };
    db.data.events.push(event);
    for (const t of def.tickets) {
      db.data.ticketTypes.push({
        id: uuid(),
        eventId: event.id,
        name: t.name,
        price: t.price,
        capacity: t.capacity,
        availableQuantity: t.capacity - Math.floor(Math.random() * t.capacity * 0.3),
        perks: t.perks,
      });
    }
    // a couple of seed reviews
    const sampleReviews = [
      { rating: 5, comment: "Smooth entry and a genuinely fun time." },
      { rating: 4, comment: "Great vibe, would go again." },
    ];
    for (const r of sampleReviews) {
      db.data.reviews.push({
        id: uuid(),
        eventId: event.id,
        userId: friends[Math.floor(Math.random() * friends.length)].id,
        userName: "Attendee",
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // ---------- DEMO SQUAD with a booked event, tickets and meetpoint ----------
  const techFest = db.data.events.find((e) => e.title === "TechFest 2026");
  const generalType = db.data.ticketTypes.find(
    (t) => t.eventId === techFest.id && t.name === "General"
  );

  const squad = {
    id: uuid(),
    name: "TechFest Squad",
    creatorId: demoUser.id,
    eventId: techFest.id,
    createdAt: new Date().toISOString(),
  };
  db.data.squads.push(squad);
  const squadMemberIds = [demoUser.id, friends[0].id, friends[1].id, friends[2].id];
  for (const uid of squadMemberIds) {
    db.data.squadMembers.push({ id: uuid(), squadId: squad.id, userId: uid, status: "accepted" });
  }

  const booking = {
    id: uuid(),
    userId: demoUser.id,
    eventId: techFest.id,
    items: [{ ticketTypeId: generalType.id, quantity: 4 }],
    totalAmount: generalType.price * 4,
    paymentStatus: "successful",
    bookingStatus: "confirmed",
    createdAt: new Date().toISOString(),
  };
  db.data.bookings.push(booking);

  for (let i = 0; i < squadMemberIds.length; i++) {
    const attendee = db.data.users.find((u) => u.id === squadMemberIds[i]);
    const ticketId = `EVT-${uuid().split("-")[0].toUpperCase()}`;
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({ ticketId, eventId: techFest.id, bookingId: booking.id }),
      { margin: 1, width: 240 }
    );
    db.data.tickets.push({
      id: ticketId,
      bookingId: booking.id,
      eventId: techFest.id,
      attendeeId: attendee.id,
      attendeeName: attendee.name,
      ticketType: "General",
      price: generalType.price,
      qrCode,
      ticketStatus: "valid",
      createdAt: new Date().toISOString(),
    });
  }
  generalType.availableQuantity -= 4;

  db.data.meetingPoints.push({
    id: uuid(),
    squadId: squad.id,
    location: "Main Metro Gate",
    lat: 28.4595,
    lng: 77.0266,
    legs: [
      { userId: demoUser.id, name: demoUser.name, minutes: 12 },
      { userId: friends[0].id, name: friends[0].name, minutes: 18 },
      { userId: friends[1].id, name: friends[1].name, minutes: 15 },
      { userId: friends[2].id, name: friends[2].name, minutes: 20 },
    ],
    status: "accepted",
  });

  db.data.outingPlans.push({
    id: uuid(),
    squadId: squad.id,
    eventId: techFest.id,
    steps: [
      { time: "16:30", emoji: "📍", label: "Meet at the meeting point" },
      { time: "16:45", emoji: "🚶", label: "Walk to the venue" },
      { time: "17:00", emoji: "🎟️", label: "TechFest 2026 starts" },
      { time: "20:00", emoji: "📸", label: "Group photo / free time" },
      { time: "20:30", emoji: "🚕", label: "Head back" },
    ],
  });

  await db.write();
  console.log("Seed complete:");
  console.log(`  ${db.data.users.length} users (demo: demo@eventra.com / Demo@123)`);
  console.log(`  ${db.data.events.length} events`);
  console.log(`  1 demo squad with tickets, meetpoint & outing plan`);
}

// Only auto-run when this file is executed directly (`npm run seed`),
// not when imported by server.js for auto-seeding on boot.
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
