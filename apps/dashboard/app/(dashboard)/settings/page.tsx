"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, LogOut, Settings as SettingsIcon } from "lucide-react";
import type { UserData } from "@/src/types/dashboard";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.user) router.push("/auth/login");
      else { setUser(d.user); setUsername(d.user.username); setEmail(d.user.email); }
    }).catch(() => router.push("/auth/login"));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
            <SettingsIcon size={30} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your account and configuration</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ryzen-500 to-red-600 text-xl font-bold text-white shadow-lg">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.username}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{user?.email}</span>
              {user?.role === "ADMIN" && (
                <span className="badge-green text-[10px]"><Shield size={10} /> Admin</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><span>👤</span> Username</label>
              <div className="relative mt-1.5">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="input-field pl-9 bg-slate-800/50 border-slate-700/30 focus:border-ryzen-500/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><span>📧</span> Email</label>
              <div className="relative mt-1.5">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9 bg-slate-800/50 border-slate-700/30 focus:border-ryzen-500/30" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button type="submit" className="btn-primary">
              <Save size={16} /> {saved ? "✅ Saved!" : "💾 Save Changes"}
            </button>
            <button type="button" onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
