import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, MapPin } from "lucide-react";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import Button from "../components/Button";

function isPast(dateStr) {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    api
      .myTickets()
      .then((d) => setTickets(d.tickets))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) =>
    tab === "upcoming" ? !isPast(t.event?.date) : isPast(t.event?.date)
  );

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-10">
      <h1 className="font-display font-bold text-2xl text-ink mb-5">My Tickets</h1>

      <div className="flex gap-2 mb-6">
        {["upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-ink text-white" : "bg-white text-ink-soft shadow-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl2 bg-white shadow-soft animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={tab === "upcoming" ? "No upcoming tickets" : "No past tickets yet"}
          description="Book an event and your digital ticket will show up here with a QR code."
          action={
            <Button as={Link} to="/discover">
              Explore events
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Link
              key={t.id}
              to={`/tickets/${t.id}`}
              className="flex items-center gap-3.5 bg-white rounded-xl2 p-4 shadow-soft hover:shadow-card transition-shadow"
            >
              <img src={t.qrCode} alt="" className="w-16 h-16 rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink truncate">{t.event?.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-ink-faint mt-1">
                  <Calendar size={12} />
                  {t.event?.date}
                  <span className="mx-0.5">·</span>
                  <MapPin size={12} />
                  <span className="truncate">{t.event?.venue}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge tone="violet">{t.ticketType}</Badge>
                  <span className="font-mono text-[11px] text-ink-faint">{t.id}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
