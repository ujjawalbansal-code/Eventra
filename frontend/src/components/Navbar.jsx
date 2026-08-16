import { Link, NavLink, useNavigate } from "react-router-dom";
import { Ticket, Users, Compass, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/tickets", label: "My Tickets", icon: Ticket },
  { to: "/squads", label: "Squads", icon: Users },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="hidden md:flex sticky top-0 z-40 items-center justify-between px-8 py-3.5 bg-paper/85 backdrop-blur border-b border-ink/5">
      <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink">
        <span className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-paper text-sm">E</span>
        Eventra
      </Link>

      {user && (
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
                }`
              }
            >
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link
              to="/organizer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-ink-soft hover:bg-ink/5"
            >
              <LayoutDashboard size={16} />
              Organizer
            </Link>
            <Link to="/profile" className="flex items-center gap-2 pl-2">
              <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full bg-violet-100" />
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="p-2 rounded-full text-ink-faint hover:bg-ink/5 hover:text-coral-600"
              aria-label="Log out"
            >
              <LogOut size={17} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink">
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-white hover:bg-violet-700"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
