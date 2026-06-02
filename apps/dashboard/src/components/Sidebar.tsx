"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, PlusCircle, ShoppingCart, Ticket,
  ChevronLeft, ChevronRight, Settings, Shield, Radio,
  Wifi, HardDrive, Network,
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
      <div className="flex h-16 items-center justify-between border-b border-slate-800/50 px-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="RYZENPANEL" className="h-8 w-8 rounded-lg" />
            <div>
              <div className="text-sm font-bold text-white">RYZENPANEL</div>
              <div className="text-[10px] text-ryzen-400">Minecraft Hosting</div>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <img src="/logo.svg" alt="RYZENPANEL" className="h-8 w-8 rounded-lg" />
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          if (item.admin && !isAdmin) return null;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-ryzen-500/10 text-ryzen-400 shadow-sm shadow-ryzen-500/5"
                  : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-ryzen-400" : "text-slate-500"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/50 p-3">
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-ryzen-500/10 to-emerald-500/5 p-3">
            <p className="text-xs font-medium text-ryzen-400">Need help?</p>
            <p className="mt-1 text-[11px] text-slate-400">Open a support ticket</p>
            <Link href="/tickets/new" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ryzen-400 hover:text-ryzen-300">
              <Ticket size={12} /> Contact Support
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
