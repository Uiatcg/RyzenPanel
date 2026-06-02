"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
    <div className="w-full max-w-md card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="text-sm text-slate-400 mt-1">Start hosting Minecraft servers</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="input-field mt-1.5" placeholder="johndoe" minLength={3} maxLength={32} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field mt-1.5" placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">Password</label>
          <div className="relative mt-1.5">
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required className="input-field pr-10" placeholder="••••••••" minLength={8} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-400">Already have an account?</span>{" "}
        <Link href="/auth/login" className="text-ryzen-400 hover:text-ryzen-300 font-medium">Sign in</Link>
      </div>
    </div>
  );
}
