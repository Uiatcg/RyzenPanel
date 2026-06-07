"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, User, LogOut, Shield, Leaf } from "lucide-react";
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
    <header className="flex h-16 items-center justify-between border-b border-[rgba(61,220,132,0.08)] bg-[rgba(11,15,12,0.6)] backdrop-blur-xl px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-[rgba(61,220,132,0.06)] border border-[rgba(61,220,132,0.1)] px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3DDC84] animate-pulse-glow" />
          <span className="text-xs text-[rgba(245,247,245,0.5)]">🌿 All systems nominal</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-xl bg-[rgba(61,220,132,0.06)] border border-[rgba(61,220,132,0.1)] p-2 text-[rgba(245,247,245,0.4)] hover:bg-[rgba(61,220,132,0.12)] hover:text-[#3DDC84] transition-all">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#3DDC84] ring-2 ring-[#0B0F0C]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-xl bg-[rgba(61,220,132,0.06)] border border-[rgba(61,220,132,0.1)] px-3 py-1.5 text-sm text-[rgba(245,247,245,0.7)] hover:bg-[rgba(61,220,132,0.12)] hover:text-[#F5F7F5] transition-all"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3DDC84] to-[#1FA855] text-xs font-bold text-[#0B0F0C] shadow-sm">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:inline">{user?.username || "Loading..."}</span>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-[rgba(61,220,132,0.15)] bg-[rgba(11,15,12,0.95)] backdrop-blur-xl p-2 shadow-2xl shadow-black/50">
                <div className="border-b border-[rgba(61,220,132,0.08)] px-3 py-3">
                  <p className="text-sm font-medium text-[#F5F7F5]">{user?.username}</p>
                  <p className="text-xs text-[rgba(245,247,245,0.4)] mt-0.5">{user?.email}</p>
                  {user?.role === "ADMIN" && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[rgba(61,220,132,0.1)] px-2 py-0.5 text-[10px] font-medium text-[#3DDC84] border border-[rgba(61,220,132,0.2)]">
                      <Shield size={10} /> Admin
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  <Link href="/settings" onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[rgba(245,247,245,0.5)] hover:bg-[rgba(61,220,132,0.08)] hover:text-[#3DDC84] transition-colors">
                    <User size={15} /> Profile Settings
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[rgba(245,247,245,0.5)] hover:bg-[rgba(61,220,132,0.08)] hover:text-[#3DDC84] transition-colors">
                      <Shield size={15} /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-[rgba(61,220,132,0.08)] my-1" />
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors">
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
