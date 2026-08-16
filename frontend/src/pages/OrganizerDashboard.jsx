import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShieldCheck, Users as UsersIcon, IndianRupee } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import Badge from "../components/Badge";
import TrustRing from "../components/TrustRing";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { events } = await api.organizerEvents(user.id);
    setEvents(events);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(eventId) {
    try {
      await api.verifyEvent(eventId);
      push("Event marked as verified", "success");
      await load();
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Organizer dashboard</h1>
          <p className="text-ink-faint text-sm mt-1">Events you've created</p>
        </div>
        <Button as={Link} to="/organizer/new" size="sm">
          <Plus size={15} /> Create event
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl2 bg-white shadow-soft animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create your first event to start selling tickets and building trust with attendees."
          action={
            <Button as={Link} to="/organizer/new">
              Create your first event
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="bg-white rounded-xl2 shadow-soft p-4 flex items-center gap-4">
              <img src={e.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink truncate">{e.title}</p>
                <div className="flex items-center gap-3 text-xs text-ink-faint mt-1">
                  <span className="flex items-center gap-1">
                    <UsersIcon size={12} /> {e.attendeeCount} attendees
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee size={12} /> {e.revenue} revenue
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {e.organizerVerified ? (
                    <Badge tone="mint">
                      <ShieldCheck size={11} /> Verified
                    </Badge>
                  ) : (
                    <button
                      onClick={() => handleVerify(e.id)}
                      className="text-xs font-medium text-violet-600 hover:underline"
                    >
                      Mark as verified
                    </button>
                  )}
                </div>
              </div>
              <TrustRing value={e.trust.score} size={48} stroke={4} sublabel="/100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
