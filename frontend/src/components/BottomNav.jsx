import { NavLink } from "react-router-dom";
import { Compass, Ticket, Users, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/squads", label: "Squads", icon: Users },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-ink/8 flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive ? "text-violet-600" : "text-ink-faint"
            }`
          }
        >
          <l.icon size={20} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
