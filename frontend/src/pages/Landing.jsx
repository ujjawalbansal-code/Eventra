import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShieldCheck, Users, MapPinned, QrCode, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import TrustRing from "../components/TrustRing";

const STEPS = [
  { icon: ShieldCheck, title: "Verify", text: "Every event carries a live Trust Score before you pay a rupee." },
  { icon: QrCode, title: "Book", text: "Pick a simple ticket tier or a seat, pay, and get a QR ticket instantly." },
  { icon: Users, title: "Squad up", text: "Add friends, split tickets, and see who's confirmed at a glance." },
  { icon: MapPinned, title: "Meet & go", text: "Eventra finds the meeting point and builds the outing plan for you." },
];

const CATEGORIES = ["Tech", "Music", "Comedy", "Gaming", "Art", "Culture", "Startups", "Photography"];

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.listEvents({ sort: "trust" }).then((d) => setFeatured(d.events.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 md:px-10 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-100 blur-3xl opacity-70" aria-hidden />
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-coral-50 blur-3xl opacity-70" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white shadow-soft rounded-full px-3.5 py-1.5 text-xs font-semibold text-violet-700 mb-6">
            <ShieldCheck size={14} /> Verified events, every time
          </span>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] text-ink">
            From finding an event
            <br />
            to <span className="text-violet-600">enjoying it together.</span>
          </h1>
          <p className="mt-5 text-ink-soft text-base md:text-lg max-w-xl mx-auto">
            Eventra turns booking a ticket into planning a whole outing — trust scores,
            simple seat picks, squads, digital tickets, and a smart meeting point, all
            in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button as={Link} to="/discover" size="lg">
              Explore events <ArrowRight size={17} />
            </Button>
            <Button as={Link} to="/register" size="lg" variant="outline">
              Create account
            </Button>
          </div>
        </div>
      </section>

      {/* Featured events */}
      {featured.length > 0 && (
        <section className="px-6 md:px-10 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-xl text-ink">Highly trusted, happening soon</h2>
              <Link to="/discover" className="text-sm font-medium text-violet-600 hover:underline">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-semibold text-xl text-ink mb-5">Browse by category</h2>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/discover?category=${encodeURIComponent(c)}`}
                className="px-4 py-2 rounded-full bg-white shadow-soft text-sm font-medium text-ink-soft hover:text-violet-600 hover:shadow-card transition-all"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-semibold text-xl text-ink mb-1">How Eventra works</h2>
          <p className="text-ink-faint text-sm mb-7">Discover → Verify → Book → Squad → Share → Meet → Attend</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.title} className="bg-white rounded-xl2 p-5 shadow-soft">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center mb-3.5">
                  <s.icon size={18} className="text-violet-600" />
                </div>
                <h3 className="font-display font-semibold text-ink">{s.title}</h3>
                <p className="text-ink-faint text-sm mt-1 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="px-6 md:px-10 pb-20">
        <div className="max-w-6xl mx-auto bg-ink rounded-xl2 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <TrustRing value={94} size={112} stroke={8} color="#8B7CF6" track="#332E57" sublabel="/ 100" className="shrink-0" />
          <div>
            <h2 className="font-display font-semibold text-2xl text-white">
              A Trust Score on every single event
            </h2>
            <p className="text-white/60 text-sm mt-2 max-w-lg leading-relaxed">
              Organizer verification, venue checks, refund policy, and real attendee
              ratings roll up into one number — so you know an event is legit before
              you ever open your wallet.
            </p>
            <Button as={Link} to="/discover" variant="accent" className="mt-5">
              Browse verified events
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
