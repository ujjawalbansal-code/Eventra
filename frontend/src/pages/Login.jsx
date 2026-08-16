import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      push("Welcome back!", "success");
      navigate(location.state?.from?.pathname || "/discover", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink mb-8 justify-center">
          <span className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-paper text-sm">E</span>
          Eventra
        </Link>
        <h1 className="font-display font-semibold text-2xl text-ink text-center">Welcome back</h1>
        <p className="text-ink-faint text-sm text-center mt-1.5">Log in to see your tickets and squads.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink-soft">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink-soft">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-coral-600 bg-coral-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Log in
          </Button>
        </form>

        <div className="mt-5 bg-violet-50 rounded-xl px-3.5 py-2.5 text-xs text-violet-700">
          Demo account — <span className="font-mono">demo@eventra.com</span> / <span className="font-mono">Demo@123</span>
        </div>

        <p className="text-center text-sm text-ink-faint mt-6">
          New to Eventra?{" "}
          <Link to="/register" className="text-violet-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
