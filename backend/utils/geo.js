// Mock geo layer. Real implementation would call a maps/directions API -
// this is isolated here so that swap is a one-file change later.

// A small set of well-known landmark "meeting points" around a demo city.
export const CANDIDATE_MEETPOINTS = [
  { name: "Main Metro Gate", lat: 28.4595, lng: 77.0266 },
  { name: "City Central Mall Entrance", lat: 28.4744, lng: 77.0369 },
  { name: "Cyber Hub Fountain", lat: 28.4949, lng: 77.0891 },
  { name: "University Bus Stand", lat: 28.4521, lng: 77.0294 },
  { name: "Sector 29 Market Gate", lat: 28.4669, lng: 77.0637 },
];

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Rough travel-time estimate: mixed walk/transit average speed of 22km/h in-city.
export function estimateMinutes(km) {
  return Math.max(3, Math.round((km / 22) * 60));
}

// Given member starting points, pick the candidate that minimizes the
// combined (summed) travel time for the whole squad.
export function suggestMeetingPoint(memberLocations) {
  let best = null;
  for (const candidate of CANDIDATE_MEETPOINTS) {
    const legs = memberLocations.map((m) => {
      const km = haversineKm(m, candidate);
      return { userId: m.userId, name: m.name, km, minutes: estimateMinutes(km) };
    });
    const total = legs.reduce((s, l) => s + l.minutes, 0);
    if (!best || total < best.total) {
      best = { candidate, legs, total };
    }
  }
  return best;
}
