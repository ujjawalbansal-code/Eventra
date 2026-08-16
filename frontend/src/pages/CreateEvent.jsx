import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";

const CATEGORIES = ["Tech", "Music", "Comedy", "Gaming", "Art", "Culture", "Startups", "Photography", "Other"];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Tech",
    venue: "",
    date: "",
    time: "18:00",
    organizerName: "",
  });
  const [ticketTypes, setTicketTypes] = useState([{ name: "General", price: 299, capacity: 100 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateTicket(i, field, value) {
    setTicketTypes((tt) => tt.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  function addTicketType() {
    setTicketTypes((tt) => [...tt, { name: "", price: 0, capacity: 50 }]);
  }

  function removeTicketType(i) {
    setTicketTypes((tt) => tt.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.venue || !form.date) {
      setError("Title, venue and date are required.");
      return;
    }
    setSaving(true);
    try {
      const { event } = await api.createEvent({
        ...form,
        ticketTypes: ticketTypes.map((t) => ({ ...t, price: Number(t.price), capacity: Number(t.capacity) })),
      });
      push("Event created!", "success");
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 pt-8 pb-14">
      <Link to="/organizer" className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink mb-5">
        <ArrowLeft size={15} /> Organizer dashboard
      </Link>
      <h1 className="font-display font-bold text-2xl text-ink mb-6">Create an event</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-ink-soft">Event title</label>
          <input
            value={form.title}
            onChange={update("title")}
            className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
            placeholder="Campus Music Night"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-soft">Description</label>
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none resize-none"
            placeholder="What should attendees expect?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink-soft">Category</label>
            <select
              value={form.category}
              onChange={update("category")}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-soft">Organizer name</label>
            <input
              value={form.organizerName}
              onChange={update("organizerName")}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
              placeholder="Your club or brand"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-soft">Venue</label>
          <input
            value={form.venue}
            onChange={update("venue")}
            className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
            placeholder="Main Auditorium"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink-soft">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={update("date")}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-soft">Time</label>
            <input
              type="time"
              value={form.time}
              onChange={update("time")}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ink-soft">Ticket types</label>
            <button type="button" onClick={addTicketType} className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-1">
              <Plus size={13} /> Add tier
            </button>
          </div>
          <div className="space-y-2.5">
            {ticketTypes.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-soft">
                <input
                  value={t.name}
                  onChange={(e) => updateTicket(i, "name", e.target.value)}
                  placeholder="Name"
                  className="flex-1 min-w-0 rounded-lg border border-ink/10 px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
                />
                <input
                  type="number"
                  min="0"
                  value={t.price}
                  onChange={(e) => updateTicket(i, "price", e.target.value)}
                  placeholder="₹"
                  className="w-20 rounded-lg border border-ink/10 px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
                />
                <input
                  type="number"
                  min="1"
                  value={t.capacity}
                  onChange={(e) => updateTicket(i, "capacity", e.target.value)}
                  placeholder="Qty"
                  className="w-16 rounded-lg border border-ink/10 px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
                />
                {ticketTypes.length > 1 && (
                  <button type="button" onClick={() => removeTicketType(i)} aria-label="Remove tier">
                    <X size={15} className="text-ink-faint hover:text-coral-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-coral-600 bg-coral-50 rounded-lg px-3 py-2">{error}</p>}

        <Button type="submit" loading={saving} size="lg" className="w-full">
          Publish event
        </Button>
      </form>
    </div>
  );
}
