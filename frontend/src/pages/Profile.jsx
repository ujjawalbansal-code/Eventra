import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Ticket, Users, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";
import Badge from "../components/Badge";
import Button from "../components/Button";

const ALL_INTERESTS = ["Tech", "Music", "Comedy", "Gaming", "Art", "Culture", "Startups", "Photography"];

export default function Profile() {
  const { user, setUser } = useAuth();
  const { push } = useToast();
  const [interests, setInterests] = useState(user?.interests || []);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [squads, setSquads] = useState([]);

  useEffect(() => {
    api.myBookings().then((d) => setBookings(d.bookings)).catch(() => {});
    api.mySquads().then((d) => setSquads(d.squads)).catch(() => {});
  }, []);

  function toggleInterest(i) {
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({ interests });
      setUser(updated);
      push("Profile updated", "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const upcoming = bookings.filter((b) => b.event && new Date(b.event.date) >= new Date(new Date().toDateString()));
  const past = bookings.filter((b) => b.event && new Date(b.event.date) < new Date(new Date().toDateString()));

  return (
    <div className="max-w-xl mx-auto px-6 pt-8 pb-14">
      <div className="flex items-center gap-4">
        <img src={user.profileImage} alt="" className="w-16 h-16 rounded-full bg-violet-100" />
        <div>
          <h1 className="font-display font-bold text-xl text-ink">{user.name}</h1>
          <p className="text-ink-faint text-sm flex items-center gap-1 mt-0.5">
            <MapPin size={13} /> {user.location}
          </p>
        </div>
      </div>

      {/* Interests */}
      <section className="mt-8">
        <h2 className="font-display font-semibold text-ink mb-3">Interests</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map((i) => (
            <button
              key={i}
              onClick={() => toggleInterest(i)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                interests.includes(i) ? "bg-ink text-white" : "bg-white text-ink-soft shadow-soft"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <Button onClick={handleSave} loading={saving} size="sm" className="mt-4">
          Save interests
        </Button>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <div className="bg-white rounded-xl2 p-4 shadow-soft flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center">
            <Ticket size={16} className="text-violet-600" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none">{bookings.length}</p>
            <p className="text-xs text-ink-faint mt-1">Bookings</p>
          </div>
        </div>
        <div className="bg-white rounded-xl2 p-4 shadow-soft flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center">
            <Users size={16} className="text-violet-600" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none">{squads.length}</p>
            <p className="text-xs text-ink-faint mt-1">Squads</p>
          </div>
        </div>
      </div>

      {/* Upcoming events */}
      <section className="mt-8">
        <h2 className="font-display font-semibold text-ink mb-3">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing booked yet.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <Link
                key={b.id}
                to={`/events/${b.event.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-3.5 shadow-soft"
              >
                <span className="text-sm font-medium text-ink">{b.event.title}</span>
                {b.paymentStatus === "successful" && (
                  <Badge tone="mint">
                    <Check size={11} /> Confirmed
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display font-semibold text-ink mb-3">Past events</h2>
          <div className="space-y-2">
            {past.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-white rounded-xl p-3.5 shadow-soft opacity-70">
                <span className="text-sm font-medium text-ink">{b.event.title}</span>
                <Badge tone="neutral">Attended</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My squads */}
      <section className="mt-8">
        <h2 className="font-display font-semibold text-ink mb-3">My squads</h2>
        {squads.length === 0 ? (
          <p className="text-sm text-ink-faint">No squads yet.</p>
        ) : (
          <div className="space-y-2">
            {squads.map((s) => (
              <Link key={s.id} to={`/squads/${s.id}`} className="flex items-center justify-between bg-white rounded-xl p-3.5 shadow-soft">
                <span className="text-sm font-medium text-ink">{s.name}</span>
                <span className="text-xs text-ink-faint">{s.members.length} members</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
