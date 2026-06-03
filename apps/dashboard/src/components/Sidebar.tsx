"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, PlusCircle, ShoppingCart, Ticket,
  ChevronLeft, ChevronRight, Settings, Shield, Radio,
  Zap, Diamond,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-servers", label: "My Servers", icon: Server },
  { href: "/create-server", label: "Create Server", icon: PlusCircle },
  { href: "/wings", label: "Wings", icon: Radio },
  { href: "/billing", label: "Billing", icon: ShoppingCart },
  { href: "/tickets", label: "Support", icon: Ticket },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield, admin: true },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`relative flex flex-col border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/50 px-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ryzen-500 to-red-600 ryzen-glow-sm transition-all group-hover:scale-105 group-hover:rotate-3">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide text-white">RYZENPANEL</div>
              <div className="text-[8px] font-semibold mc-gradient-text tracking-[0.2em] uppercase">Minecraft Hosting</div>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ryzen-500 to-red-600 ryzen-glow-sm transition-all group-hover:scale-105">
              <Zap size={18} className="text-white" />
            </div>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-all">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {navItems.map((item) => {
          if (item.admin && !isAdmin) return null;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? "bg-gradient-to-r from-ryzen-500/15 to-transparent text-ryzen-400"
                  : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-ryzen-400" />
              )}
              <item.icon size={18} className={isActive ? "text-ryzen-400" : "text-slate-500"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Support card */}
      <div className="border-t border-slate-800/50 p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-gradient-to-br from-ryzen-500/10 to-red-600/5 border border-ryzen-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Diamond size={12} className="text-ryzen-400" />
              <p className="text-xs font-semibold text-ryzen-400">Need assistance?</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Our team is ready to help 24/7</p>
            <Link href="/tickets/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ryzen-500/10 px-3 py-1.5 text-[11px] font-medium text-ryzen-400 hover:bg-ryzen-500/20 transition-colors"
            >
              <Ticket size={12} /> Open Ticket
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link href="/tickets/new"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-ryzen-500/10 text-ryzen-400 hover:bg-ryzen-500/20 transition-colors"
            >
              <Ticket size={16} />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
