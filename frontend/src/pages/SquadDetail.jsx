import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  X,
  MapPinned,
  Sparkles,
  Ticket as TicketIcon,
  Clock,
  Check,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import Badge from "../components/Badge";
import TrustRing from "../components/TrustRing";
import EventCard from "../components/EventCard";

export default function SquadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { push } = useToast();

  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  async function loadSquad() {
    const { squad } = await api.getSquad(id);
    setSquad(squad);
    return squad;
  }

  useEffect(() => {
    loadSquad().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.addSquadMember(id, { email: inviteEmail });
      await loadSquad();
      push("Member added to squad", "success");
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId) {
    try {
      await api.removeSquadMember(id, userId);
      await loadSquad();
    } catch (err) {
      push(err.message, "error");
    }
  }

  async function handleSuggestMeetpoint() {
    setSuggesting(true);
    try {
      const { suggestion } = await api.suggestMeetpoint(id);
      setSuggestion(suggestion);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleAcceptMeetpoint(candidate) {
    setAccepting(true);
    try {
      await api.acceptMeetpoint(id, {
        location: candidate.candidate.name,
        lat: candidate.candidate.lat,
        lng: candidate.candidate.lng,
        legs: candidate.legs,
      });
      await loadSquad();
      setSuggestion(null);
      push("Meeting point set!", "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setAccepting(false);
    }
  }

  async function handleGeneratePlan() {
    setGeneratingPlan(true);
    try {
      await api.generatePlan(id, { meetTime: "16:30" });
      await loadSquad();
      push("Outing plan created", "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setGeneratingPlan(false);
    }
  }

  async function handleFindEvent() {
    setLoadingRecs(true);
    try {
      const { recommendations } = await api.squadRecommendations(id);
      setRecommendations(recommendations);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setLoadingRecs(false);
    }
  }

  async function handleAttachEvent(eventId) {
    try {
      await api.updateSquad(id, { eventId });
      await loadSquad();
      setRecommendations(null);
      push("Event attached to squad", "success");
    } catch (err) {
      push(err.message, "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!squad) return null;

  const isCreator = squad.creatorId === user.id;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-14">
      <Link to="/squads" className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink mb-5">
        <ArrowLeft size={15} /> Squads
      </Link>

      <h1 className="font-display font-bold text-2xl text-ink">{squad.name}</h1>
      <p className="text-ink-faint text-sm mt-1">
        {squad.event ? squad.event.title : "No event attached yet"}
      </p>

      {/* Members */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink">
            Members <span className="text-ink-faint font-normal">({squad.members.length})</span>
          </h2>
          <button
            onClick={() => setShowInvite((s) => !s)}
            className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline"
          >
            <UserPlus size={15} /> Invite
          </button>
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} className="flex gap-2 mb-3">
            <input
              type="email"
              required
              autoFocus
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
            />
            <Button type="submit" loading={inviting}>
              Add
            </Button>
          </form>
        )}

        <div className="space-y-2">
          {squad.members.map((m) => {
            const memberTicket = squad.tickets.find((t) => t.attendeeId === m.id);
            return (
              <div key={m.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-soft">
                <img src={m.profileImage} alt="" className="w-9 h-9 rounded-full bg-violet-100" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">
                    {m.name} {m.id === user.id && <span className="text-ink-faint font-normal">(you)</span>}
                  </p>
                  <p className="text-xs text-ink-faint truncate">{m.email}</p>
                </div>
                {memberTicket ? (
                  <Badge tone="mint">
                    <Check size={11} /> {memberTicket.id}
                  </Badge>
                ) : squad.event ? (
                  <Badge tone="neutral">No ticket</Badge>
                ) : null}
                {isCreator && m.id !== user.id && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="p-1.5 text-ink-faint hover:text-coral-600"
                    aria-label={`Remove ${m.name}`}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Event attach / recommendations */}
      {!squad.event && (
        <section className="mt-8 bg-white rounded-xl2 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={17} className="text-violet-600" />
            <h2 className="font-display font-semibold text-ink">Find something for your squad</h2>
          </div>
          <p className="text-sm text-ink-faint mb-3">
            We'll rank events by shared interests, budget, and distance for this squad.
          </p>
          {!recommendations ? (
            <Button onClick={handleFindEvent} loading={loadingRecs} variant="subtle">
              Get squad matches
            </Button>
          ) : (
            <div className="space-y-3 mt-3">
              {recommendations.map((r) => (
                <div key={r.event.id} className="flex items-center gap-3 bg-violet-50 rounded-xl p-3">
                  <TrustRing value={r.match.percent} size={44} stroke={4} color="#5A42DE" track="#E4E0FD" sublabel="match" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{r.event.title}</p>
                    <p className="text-xs text-ink-faint truncate">{r.match.reasons[0]}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAttachEvent(r.event.id)}>
                    Pick
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tickets */}
      {squad.event && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <TicketIcon size={17} className="text-violet-600" />
            <h2 className="font-display font-semibold text-ink">
              Tickets <span className="text-ink-faint font-normal">({squad.tickets.length} confirmed)</span>
            </h2>
          </div>
          {squad.tickets.length === 0 ? (
            <div className="bg-white rounded-xl2 p-4 shadow-soft text-sm text-ink-faint">
              No one has booked tickets for this event yet.{" "}
              <Link to={`/events/${squad.event.id}/book`} className="text-violet-600 font-medium hover:underline">
                Book now
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {squad.tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-soft">
                  <div className="flex items-center gap-2.5">
                    <img src={t.qrCode} alt="" className="w-8 h-8 rounded" />
                    <span className="text-sm text-ink">{t.attendeeName}</span>
                  </div>
                  <span className="font-mono text-xs text-ink-faint">{t.id}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Meeting point */}
      {squad.event && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <MapPinned size={17} className="text-violet-600" />
            <h2 className="font-display font-semibold text-ink">Smart MeetPoint</h2>
          </div>

          {squad.meetingPoint ? (
            <div className="bg-white rounded-xl2 p-4 shadow-soft">
              <p className="font-medium text-ink">📍 {squad.meetingPoint.location}</p>
              <ul className="mt-2.5 space-y-1.5">
                {squad.meetingPoint.legs.map((l) => (
                  <li key={l.userId} className="flex items-center justify-between text-sm text-ink-soft">
                    <span>{l.name}</span>
                    <span className="font-mono text-xs">{l.minutes} min</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleSuggestMeetpoint}
                className="text-xs text-violet-600 font-medium hover:underline mt-3"
              >
                Choose another point
              </button>
            </div>
          ) : suggestion ? (
            <div className="bg-white rounded-xl2 p-4 shadow-soft">
              <p className="font-medium text-ink">📍 {suggestion.candidate.name}</p>
              <ul className="mt-2.5 space-y-1.5">
                {suggestion.legs.map((l) => (
                  <li key={l.userId} className="flex items-center justify-between text-sm text-ink-soft">
                    <span>{l.name}</span>
                    <span className="font-mono text-xs">{l.minutes} min</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-faint mt-3 italic">
                Recommended because it minimizes combined travel time for the squad.
              </p>
              <div className="flex gap-2 mt-3.5">
                <Button size="sm" onClick={() => handleAcceptMeetpoint(suggestion)} loading={accepting}>
                  Accept meeting point
                </Button>
                <Button size="sm" variant="outline" onClick={handleSuggestMeetpoint}>
                  Try another
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl2 p-4 shadow-soft">
              <p className="text-sm text-ink-faint mb-3">
                Let Eventra suggest a meeting point that minimizes everyone's travel time.
              </p>
              <Button onClick={handleSuggestMeetpoint} loading={suggesting} variant="subtle">
                Suggest a meeting point
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Outing plan */}
      {squad.event && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={17} className="text-violet-600" />
            <h2 className="font-display font-semibold text-ink">Outing Plan</h2>
          </div>

          {squad.plan ? (
            <ol className="relative border-l-2 border-violet-100 ml-2.5 space-y-5 py-1">
              {squad.plan.steps.map((s, i) => (
                <li key={i} className="ml-5 relative">
                  <span className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-violet-500 border-2 border-white" />
                  <p className="text-xs font-mono text-ink-faint">{s.time}</p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    {s.emoji} {s.label}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="bg-white rounded-xl2 p-4 shadow-soft">
              <p className="text-sm text-ink-faint mb-3">
                Generate a simple plan for the day, from meeting up to heading home.
              </p>
              <Button onClick={handleGeneratePlan} loading={generatingPlan} variant="subtle">
                Generate outing plan
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
