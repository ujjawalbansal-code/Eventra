import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Clock, ShieldCheck, ShieldAlert, Star, ChevronRight, Users } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TrustRing from "../components/TrustRing";
import Badge from "../components/Badge";
import Button from "../components/Button";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getEvent(id)
      .then((d) => {
        setEvent(d.event);
        setReviews(d.reviews);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !event) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-faint">{error || "This event could not be found."}</p>
        <Link to="/discover" className="text-violet-600 text-sm font-medium hover:underline mt-3 inline-block">
          Back to discover
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Image */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden md:rounded-b-xl2 bg-violet-50">
        <img src={event.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
          <div>
            <Badge tone="violet" className="bg-white/90 mb-2">{event.category}</Badge>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 mt-6 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Key details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-xl p-3.5 shadow-soft flex items-start gap-2.5">
              <Calendar size={17} className="text-violet-500 mt-0.5" />
              <div>
                <p className="text-ink-faint text-xs">Date</p>
                <p className="font-medium text-ink">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3.5 shadow-soft flex items-start gap-2.5">
              <Clock size={17} className="text-violet-500 mt-0.5" />
              <div>
                <p className="text-ink-faint text-xs">Time</p>
                <p className="font-medium text-ink">{event.time}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3.5 shadow-soft flex items-start gap-2.5 col-span-2">
              <MapPin size={17} className="text-violet-500 mt-0.5" />
              <div>
                <p className="text-ink-faint text-xs">Venue</p>
                <p className="font-medium text-ink">{event.venue} · {event.distanceKm} km away</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">About this event</h2>
            <p className="text-ink-soft text-sm leading-relaxed">{event.description}</p>
            <p className="text-ink-faint text-xs mt-3">Organized by {event.organizerName}</p>
          </div>

          {/* Trust layer */}
          <div className="bg-white rounded-xl2 p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <TrustRing value={event.trust.score} size={64} stroke={5.5} sublabel="/ 100" />
              <div>
                <div className="flex items-center gap-1.5">
                  {event.trust.score >= 75 ? (
                    <ShieldCheck size={16} className="text-mint-600" />
                  ) : (
                    <ShieldAlert size={16} className="text-sun-500" />
                  )}
                  <h2 className="font-display font-semibold text-ink">Event Trust</h2>
                </div>
                <p className="text-sm text-ink-soft mt-0.5">
                  <span className="font-semibold">{event.trust.score}/100</span> — {event.trust.label}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {event.trust.factors.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className={f.positive ? "text-ink-soft" : "text-ink-faint"}>{f.label}</span>
                  <span className={f.positive ? "text-mint-600 font-medium" : "text-ink-faint"}>
                    {f.points > 0 ? `+${f.points}` : "0"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-display font-semibold text-lg text-ink mb-3 flex items-center gap-2">
              Reviews
              {event.reviewCount > 0 && (
                <span className="flex items-center gap-1 text-sm font-normal text-ink-faint">
                  <Star size={14} className="fill-sun-500 text-sun-500" /> {event.avgRating.toFixed(1)} ({event.reviewCount})
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-ink-faint text-sm">No reviews yet — be the first to attend and share one.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-3.5 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">{r.userName}</span>
                      <span className="flex items-center gap-0.5 text-xs text-sun-500">
                        <Star size={12} className="fill-sun-500" /> {r.rating}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-ink-soft mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky booking card */}
        <div className="md:col-span-1">
          <div className="md:sticky md:top-24 bg-white rounded-xl2 shadow-card p-5 space-y-3">
            <div>
              <p className="text-ink-faint text-xs">Starting from</p>
              <p className="font-display font-bold text-2xl text-ink">
                {event.minPrice ? `₹${event.minPrice}` : "Free"}
              </p>
            </div>
            <ul className="text-sm text-ink-soft space-y-1.5">
              {event.ticketTypes.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span>{t.name}</span>
                  <span className="font-mono text-xs">
                    {t.availableQuantity > 0 ? `${t.availableQuantity} left` : "Sold out"}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              size="lg"
              onClick={() => (user ? navigate(`/events/${id}/book`) : navigate("/login"))}
            >
              Book tickets <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (user ? navigate(`/squads?attachEvent=${id}`) : navigate("/login"))}
            >
              <Users size={16} /> Plan with squad
            </Button>
            {event.refundPolicy && (
              <p className="text-xs text-ink-faint text-center pt-1">
                Refundable up to 48 hours before the event
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
