// Deterministic "Squad Match" recommendation algorithm.
// Ranks events for a group based on shared interests, budget fit,
// date flexibility and distance. Swap-in point for a real ML/LLM
// recommender later - the interface (squad + events -> ranked list) stays.

export function squadMatchScore(event, squadMembers, squadBudget) {
  let score = 0;
  const reasons = [];

  // Interest overlap (0-40 pts)
  const interestedCount = squadMembers.filter((m) =>
    (m.interests || []).includes(event.category)
  ).length;
  const interestRatio = squadMembers.length
    ? interestedCount / squadMembers.length
    : 0;
  const interestPts = Math.round(interestRatio * 40);
  score += interestPts;
  if (interestedCount > 0) {
    reasons.push(
      `${interestedCount}/${squadMembers.length} members are interested in ${event.category}`
    );
  }

  // Budget fit (0-30 pts)
  const cheapestTicket = event.minPrice ?? 0;
  let budgetPts = 0;
  if (squadBudget && cheapestTicket <= squadBudget) {
    budgetPts = 30;
    reasons.push(`Within your squad's ₹${squadBudget} average budget`);
  } else if (squadBudget && cheapestTicket <= squadBudget * 1.25) {
    budgetPts = 15;
    reasons.push("Slightly above budget, but close");
  }
  score += budgetPts;

  // Distance (0-20 pts) - closer is better, event.distanceKm assumed provided
  const dist = event.distanceKm ?? 10;
  const distPts = Math.max(0, Math.round(20 - dist * 1.5));
  score += distPts;
  if (dist <= 10) reasons.push(`Only ${dist} km away`);

  // Trust (0-10 pts)
  const trustPts = Math.round(((event.trustScore ?? 50) / 100) * 10);
  score += trustPts;

  const percent = Math.min(99, Math.max(20, Math.round(score)));
  return { percent, reasons: reasons.slice(0, 3) };
}
