"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, LogOut, Radio, Settings as SettingsIcon } from "lucide-react";
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-emerald-600/20 border border-ryzen-500/20">
            <SettingsIcon size={28} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your account and configuration</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ryzen-500 to-emerald-600 text-xl font-bold text-white">
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
              <label className="text-xs font-medium text-slate-400">Username</label>
              <div className="relative mt-1.5">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={username} onChange={e => setUsername(e.target.value)} className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Email</label>
              <div className="relative mt-1.5">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-9" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary">
              <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
            </button>
            <button type="button" onClick={handleLogout} className="btn-secondary text-red-400 border-red-500/20 hover:bg-red-500/10">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Radio size={18} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Wings Daemon</h3>
              <p className="text-xs text-slate-500">Configure Wings node connection</p>
            </div>
          </div>
          <Link href="/wings" className="btn-ghost text-xs">
            <Radio size={14} /> View Wings
          </Link>
        </div>
        <div className="rounded-xl bg-slate-800/30 p-4">
          <p className="text-xs text-slate-400">
            Wings daemons run on your VPS machines and execute server containers. 
            Configure your nodes through the admin panel or view connected Wings.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Account Details</h3>
        <div className="space-y-3">
          {[
            ["User ID", user?.id || "—"],
            ["Role", user?.role || "—"],
            ["Credits", `$${user?.credits?.toFixed(2) || "0.00"}`],
            ["Email Verified", user?.emailVerified ? "Yes" : "No"],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between py-1.5">
              <span className="text-xs text-slate-500">{l}</span>
              <span className="text-xs font-medium text-slate-300">{v}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
