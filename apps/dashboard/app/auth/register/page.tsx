"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.message || "Registration failed");
      return;
    }
    router.push("/");
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-jungle rounded-3xl p-8 emerald-glow">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <img src="/zungle-logo.svg" alt="ZungleVibe" className="w-16 h-16 mx-auto animate-float" />
          </Link>
          <h1 className="text-2xl font-black text-[#F5F7F5]">Join the Jungle</h1>
          <p className="text-sm text-[rgba(245,247,245,0.5)] mt-1">Create your account and deploy servers</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[rgba(245,247,245,0.5)]">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="input-field mt-1.5" placeholder="jungleExplorer" minLength={3} maxLength={32} />
          </div>
          <div>
            <label className="text-xs font-medium text-[rgba(245,247,245,0.5)]">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="input-field mt-1.5" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-[rgba(245,247,245,0.5)]">Password</label>
            <div className="relative mt-1.5">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                className="input-field pr-10" placeholder="••••••••" minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(245,247,245,0.3)] hover:text-[#3DDC84] transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3.5 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Creating account...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Zap size={16} /> Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[rgba(245,247,245,0.4)]">Already have an account?</span>{" "}
          <Link href="/auth/login" className="text-[#3DDC84] hover:text-[#5AE89A] font-medium transition-colors">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
