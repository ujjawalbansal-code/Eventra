import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Users, Plus, X } from "lucide-react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

export default function Squads() {
  const { push } = useToast();
  const [searchParams] = useSearchParams();
  const attachEvent = searchParams.get("attachEvent");
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(!!attachEvent);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    api
      .mySquads()
      .then((d) => setSquads(d.squads))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (attachEvent) {
      api.getEvent(attachEvent).then((d) => setEventTitle(d.event.title)).catch(() => {});
    }
  }, [attachEvent]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { squad } = await api.createSquad({ name, eventId: attachEvent || undefined });
      setSquads((s) => [squad, ...s]);
      push("Squad created!", "success");
      setShowCreate(false);
      setName("");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-10">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-ink">Squads</h1>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus size={15} /> New squad
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl2 shadow-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-ink">Create a squad</h2>
            <button type="button" onClick={() => setShowCreate(false)} aria-label="Close">
              <X size={18} className="text-ink-faint" />
            </button>
          </div>
          {eventTitle && (
            <p className="text-sm text-violet-700 bg-violet-50 rounded-lg px-3 py-2 mb-3">
              Planning for <span className="font-medium">{eventTitle}</span>
            </p>
          )}
          <label htmlFor="squadName" className="text-sm font-medium text-ink-soft">Squad name</label>
          <input
            id="squadName"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="TechFest Squad"
            className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
          />
          <Button type="submit" loading={creating} className="w-full mt-4">
            Create squad
          </Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl2 bg-white shadow-soft animate-pulse" />
          ))}
        </div>
      ) : squads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No squads yet"
          description="Create a squad to plan an outing, split tickets, and coordinate with friends."
          action={<Button onClick={() => setShowCreate(true)}>Create your first squad</Button>}
        />
      ) : (
        <div className="space-y-3">
          {squads.map((s) => (
            <Link
              key={s.id}
              to={`/squads/${s.id}`}
              className="flex items-center gap-3.5 bg-white rounded-xl2 p-4 shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="flex -space-x-2 shrink-0">
                {s.members.slice(0, 4).map((m) => (
                  <img
                    key={m.id}
                    src={m.profileImage}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-white bg-violet-100"
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink truncate">{s.name}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  {s.members.length} member{s.members.length !== 1 ? "s" : ""}
                  {s.event ? ` · ${s.event.title}` : " · No event yet"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
