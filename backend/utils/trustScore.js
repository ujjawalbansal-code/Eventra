// Deterministic, explainable trust score for the Event Trust Layer.
// Factors are weighted and each contributes a labeled reason so the UI
// can show *why* an event scored the way it did.

export function computeTrustScore(event) {
  const factors = [];
  let score = 0;

  if (event.organizerVerified) {
    score += 30;
    factors.push({ label: "Organizer verified", points: 30, positive: true });
  } else {
    factors.push({ label: "Organizer not yet verified", points: 0, positive: false });
  }

  if (event.venueVerified) {
    score += 20;
    factors.push({ label: "Venue verified", points: 20, positive: true });
  } else {
    factors.push({ label: "Venue not verified", points: 0, positive: false });
  }

  score += 15;
  factors.push({ label: "Secure payment & digital tickets", points: 15, positive: true });

  const pastEvents = event.organizerPastEvents ?? 0;
  const historyPoints = Math.min(15, pastEvents * 3);
  score += historyPoints;
  factors.push({
    label: `${pastEvents} past event${pastEvents === 1 ? "" : "s"} hosted`,
    points: historyPoints,
    positive: historyPoints > 0,
  });

  if (event.refundPolicy) {
    score += 10;
    factors.push({ label: "Refund policy available", points: 10, positive: true });
  } else {
    factors.push({ label: "No refund policy listed", points: 0, positive: false });
  }

  const rating = event.avgRating ?? 0;
  const reviewPoints = Math.round((rating / 5) * 10);
  score += reviewPoints;
  factors.push({
    label: rating ? `${rating.toFixed(1)}★ average from attendees` : "No reviews yet",
    points: reviewPoints,
    positive: reviewPoints > 5,
  });

  score = Math.min(100, Math.round(score));

  let label = "Needs Caution";
  if (score >= 90) label = "Highly Trusted";
  else if (score >= 75) label = "Trusted";
  else if (score >= 55) label = "Generally Safe";

  return { score, label, factors };
}
