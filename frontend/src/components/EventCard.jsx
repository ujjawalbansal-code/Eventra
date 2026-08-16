import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import TrustRing from "./TrustRing";
import Badge from "./Badge";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function EventCard({ event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-white rounded-xl2 overflow-hidden shadow-soft hover:shadow-card transition-shadow duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-violet-50">
        <img
          src={event.image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge tone="violet" className="backdrop-blur bg-white/85">
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur rounded-full p-0.5">
          <TrustRing value={event.trust?.score ?? 0} size={40} stroke={3.5} sublabel="" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 text-ink-faint text-xs mt-1.5">
          <Calendar size={13} />
          <span>{formatDate(event.date)}</span>
          <span className="mx-0.5">·</span>
          <MapPin size={13} />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-sm font-semibold text-ink">
            {event.minPrice ? `From ₹${event.minPrice}` : "Free"}
          </span>
          {event.distanceKm != null && (
            <span className="text-xs text-ink-faint">{event.distanceKm} km away</span>
          )}
        </div>
      </div>
    </Link>
  );
}
