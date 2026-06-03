"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, User, LogOut, Shield, Zap } from "lucide-react";
import type { UserData } from "@/src/types/dashboard";

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) setUser(d.user);
    });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-800/30 border border-slate-700/30 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-ryzen-400 animate-pulse-glow" />
          <span className="text-xs text-slate-400">⚡ All systems nominal</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-xl bg-slate-800/30 border border-slate-700/30 p-2 text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 transition-all">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-ryzen-400 ring-2 ring-slate-900" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-xl bg-slate-800/30 border border-slate-700/30 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/30 hover:text-slate-100 transition-all"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-ryzen-500 to-red-600 text-xs font-bold text-white shadow-sm">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:inline">{user?.username || "Loading..."}</span>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl shadow-slate-950/50">
                <div className="border-b border-slate-800/50 px-3 py-3">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                  {user?.role === "ADMIN" && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-ryzen-500/10 px-2 py-0.5 text-[10px] font-medium text-ryzen-400 border border-ryzen-500/20">
                      <Shield size={10} /> Admin
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  <Link href="/settings" onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                    <User size={15} /> Profile Settings
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                      <Shield size={15} /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-slate-800/50 my-1" />
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
