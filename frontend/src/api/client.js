const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("eventra_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the Eventra server. Check your connection and try again.");
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => request("/auth/me", { method: "PUT", body: payload }),

  // events
  listEvents: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/events${qs ? `?${qs}` : ""}`, { auth: false });
  },
  getEvent: (id) => request(`/events/${id}`, { auth: false }),
  createEvent: (payload) => request("/events", { method: "POST", body: payload }),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: "PUT", body: payload }),
  verifyEvent: (id) => request(`/events/${id}/verify`, { method: "POST" }),
  organizerEvents: (organizerId) => request(`/events/organizer/${organizerId}/events`),
  eventBookings: (id) => request(`/events/${id}/bookings`),
  categories: () => request("/events/categories", { auth: false }),

  // bookings
  createBooking: (payload) => request("/bookings", { method: "POST", body: payload }),
  payBooking: (id, payload = {}) => request(`/bookings/${id}/pay`, { method: "POST", body: payload }),
  myBookings: () => request("/bookings/mine"),

  // tickets
  myTickets: () => request("/tickets"),
  getTicket: (id) => request(`/tickets/${id}`),
  assignTicket: (id, userId) => request(`/tickets/${id}/assign`, { method: "PUT", body: { userId } }),

  // squads
  mySquads: () => request("/squads/mine"),
  createSquad: (payload) => request("/squads", { method: "POST", body: payload }),
  getSquad: (id) => request(`/squads/${id}`),
  updateSquad: (id, payload) => request(`/squads/${id}`, { method: "PUT", body: payload }),
  addSquadMember: (id, payload) => request(`/squads/${id}/members`, { method: "POST", body: payload }),
  removeSquadMember: (id, userId) => request(`/squads/${id}/members/${userId}`, { method: "DELETE" }),
  squadRecommendations: (id) => request(`/squads/${id}/recommendations`),

  // meetpoint
  suggestMeetpoint: (squadId) => request(`/meetpoint/${squadId}/suggest`),
  acceptMeetpoint: (squadId, payload) => request(`/meetpoint/${squadId}`, { method: "POST", body: payload }),
  getMeetpoint: (squadId) => request(`/meetpoint/${squadId}`),

  // plan
  getPlan: (squadId) => request(`/plan/${squadId}`),
  generatePlan: (squadId, payload = {}) => request(`/plan/${squadId}/generate`, { method: "POST", body: payload }),
  updatePlan: (squadId, payload) => request(`/plan/${squadId}`, { method: "PUT", body: payload }),

  // reviews
  addReview: (payload) => request("/reviews", { method: "POST", body: payload }),
};

export function saveToken(token) {
  localStorage.setItem("eventra_token", token);
}
export function clearToken() {
  localStorage.removeItem("eventra_token");
}
