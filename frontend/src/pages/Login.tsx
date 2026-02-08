import { useEffect, useState } from "react";

// import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, user } = useAuth();
  useEffect(() => {
    if (user) {
      logout(); // Ends session and redirects to /login
    }
    // Intentional: run once on page load to clear any existing session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    login(email, password).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to log in right now.");
    }).finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] px-4 py-12 text-slate-900 font-[Poppins]">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white grid place-items-center text-sm font-semibold">
              RO
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Retail Ops</p>
              <p className="text-sm text-slate-500">Minimal control desk</p>
            </div>
          </div>
          <span className="text-xs text-slate-500">v1.0</span>
        </header>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <section className="bg-white border border-slate-200 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Sign in</p>
            <h1 className="text-3xl font-semibold leading-tight mb-3">
              Use this sample admin account to explore the features
            </h1>
            <p className="text-base text-slate-600">
              email:admin@pos.com
              password:123456
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Work email</label>
                <input
                  type="email"
                  placeholder="you@store.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-semibold text-base py-3.5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Snapshot</p>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Active stores</span>
                <span className="font-semibold text-slate-900">42</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 mt-3">
                <span>Low-stock alerts</span>
                <span className="font-semibold text-amber-600">7</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 mt-3">
                <span>Pending returns</span>
                <span className="font-semibold text-slate-900">12</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Tips</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Use your work email—personal accounts are blocked.</li>
                <li>Forgot access? Ask your admin to reset credentials.</li>
                <li>Keep sessions short on shared devices.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Login;
