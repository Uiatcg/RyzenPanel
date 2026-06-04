"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Server, Plus, Settings, Shield, ShoppingCart, Ticket, LayoutDashboard } from "lucide-react";

const actions = [
  { id: "dashboard", label: "Go to Dashboard", href: "/", icon: LayoutDashboard, keywords: "home overview" },
  { id: "servers", label: "View My Servers", href: "/my-servers", icon: Server, keywords: "servers list" },
  { id: "create", label: "Create New Server", href: "/create-server", icon: Plus, keywords: "new deploy" },
  { id: "billing", label: "Billing & Plans", href: "/billing", icon: ShoppingCart, keywords: "payment upgrade" },
  { id: "tickets", label: "Support Tickets", href: "/tickets", icon: Ticket, keywords: "help support" },
  { id: "settings", label: "Account Settings", href: "/settings", icon: Settings, keywords: "profile account" },
  { id: "admin", label: "Admin Panel", href: "/admin", icon: Shield, keywords: "admin manage", admin: true },
];

export function CommandPalette({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(v => !v); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) { setQuery(""); setSelectedIndex(0); }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const filtered = actions.filter(a => {
    if (a.admin && !isAdmin) return false;
    const s = query.toLowerCase();
    return a.label.toLowerCase().includes(s) || a.keywords.toLowerCase().includes(s);
  });

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex].href); }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="card p-0 overflow-hidden shadow-2xl shadow-slate-950/60">
          <div className="flex items-center border-b border-slate-800/50 px-4">
            <Search size={16} className="text-slate-500" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder-slate-500"
              placeholder="Search pages and actions..."
            />
            <kbd className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">ESC</kbd>
          </div>
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No results found</div>
          ) : (
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.map((a, i) => (
                <button key={a.id} onClick={() => handleSelect(a.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    i === selectedIndex ? "bg-ryzen-500/10 text-ryzen-400" : "text-slate-300 hover:bg-slate-800/30"
                  }`}
                >
                  <a.icon size={16} className={i === selectedIndex ? "text-ryzen-400" : "text-slate-500"} />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-slate-800/50 px-4 py-2 text-[10px] text-slate-600">
            <span className="inline-flex items-center gap-1 mr-3"><kbd className="rounded border border-slate-700 bg-slate-800 px-1">↑↓</kbd> Navigate</span>
            <span className="inline-flex items-center gap-1 mr-3"><kbd className="rounded border border-slate-700 bg-slate-800 px-1">↵</kbd> Open</span>
            <span className="inline-flex items-center gap-1"><kbd className="rounded border border-slate-700 bg-slate-800 px-1">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  );
}
