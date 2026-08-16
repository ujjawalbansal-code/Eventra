import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";

export default function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      push("Account created — welcome to Eventra!", "success");
      navigate("/discover", { replace: true });
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
        <h1 className="font-display font-semibold text-2xl text-ink text-center">Create your account</h1>
        <p className="text-ink-faint text-sm text-center mt-1.5">Takes less than a minute.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink-soft">Full name</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={update("name")}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
              placeholder="Ujjawal Sharma"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink-soft">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
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
              minLength={6}
              value={form.password}
              onChange={update("password")}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm focus:border-violet-500 outline-none"
              placeholder="At least 6 characters"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-coral-600 bg-coral-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-ink-faint mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
