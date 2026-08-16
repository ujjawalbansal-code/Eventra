import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../api/client";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["All", "Tech", "Music", "Comedy", "Gaming", "Art", "Culture", "Startups", "Photography"];

export default function Discover() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .listEvents({ q: query, category: category === "All" ? undefined : category, sort })
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [query, category, sort]);

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (category !== "All") params.category = category;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  return (
    <div className="px-6 md:px-10 pt-8 pb-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Discover events</h1>
          <p className="text-ink-faint text-sm mt-1">
            {user ? `Near ${user.location}` : "Local fests, gigs, and workshops"}
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="mt-5 flex items-center gap-2 sticky top-0 md:top-[65px] bg-paper/90 backdrop-blur py-3 z-20 -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex-1 relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues..."
            className="w-full rounded-full border border-ink/10 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="p-2.5 rounded-full border border-ink/10 bg-white text-ink-soft hover:border-violet-400"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-ink/10 bg-white px-3.5 py-2 text-sm text-ink-soft"
          >
            <option value="date">Sort: Soonest</option>
            <option value="price">Sort: Price, low to high</option>
            <option value="trust">Sort: Most trusted</option>
          </select>
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c ? "bg-ink text-white" : "bg-white text-ink-soft shadow-soft hover:text-violet-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl2 bg-white shadow-soft animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={X}
          title="No events found"
          description="Try changing your filters or search for something else."
          action={
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
