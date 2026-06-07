"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Zap, Leaf } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.message || "Invalid credentials");
      return;
    }
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="glass-jungle rounded-3xl p-8 emerald-glow">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <img src="/zungle-logo.svg" alt="ZungleVibe" className="w-16 h-16 mx-auto animate-float" />
            </Link>
            <h1 className="text-2xl font-black text-[#F5F7F5]">Welcome Back</h1>
            <p className="text-sm text-[rgba(245,247,245,0.5)] mt-1">Sign in to the jungle</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[rgba(245,247,245,0.5)]">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field mt-1.5" placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[rgba(245,247,245,0.5)]">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-field pr-10" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(245,247,245,0.3)] hover:text-[#3DDC84] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Zap size={16} /> Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(61,220,132,0.1)]" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[rgba(28,43,32,0.6)] px-3 text-[rgba(245,247,245,0.3)]">🌿 Or continue with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href="/api/auth/discord"
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(61,220,132,0.12)] bg-[rgba(61,220,132,0.06)] px-4 py-2.5 text-sm font-medium text-[rgba(245,247,245,0.6)] hover:bg-[rgba(61,220,132,0.12)] hover:border-[rgba(61,220,132,0.25)] transition-all">
                💬 Discord
              </a>
              <button disabled
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(61,220,132,0.06)] bg-[rgba(61,220,132,0.03)] px-4 py-2.5 text-sm font-medium text-[rgba(245,247,245,0.25)] cursor-not-allowed">
                🐙 GitHub
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/auth/reset" className="text-[rgba(245,247,245,0.4)] hover:text-[#3DDC84] transition-colors">Forgot password?</Link>
            <Link href="/auth/register" className="text-[#3DDC84] hover:text-[#5AE89A] font-medium transition-colors flex items-center gap-1">
              Create account <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
