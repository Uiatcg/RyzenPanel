"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, PlusCircle, ShoppingCart, Ticket,
  ChevronLeft, ChevronRight, Settings, Shield, Radio,
  Coins, Users, Menu, X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-servers", label: "My Servers", icon: Server },
  { href: "/create-server", label: "Create Server", icon: PlusCircle },
  { href: "/credits", label: "Credits", icon: Coins },
  { href: "/community", label: "Community", icon: Users },
  { href: "/wings", label: "Daemon", icon: Radio },
  { href: "/billing", label: "Billing", icon: ShoppingCart },
  { href: "/tickets", label: "Support", icon: Ticket },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield, admin: true },
];

export function JungleSidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState("/zungle-logo.svg");
  const [panelName, setPanelName] = useState("ZungleVibe");

  useEffect(() => {
    fetch("/api/credits?tab=overview")
      .then(r => r.json())
      .then(d => { if (d.credits !== undefined) setCredits(d.credits); })
      .catch(() => {});

    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.panelName) setPanelName(d.panelName);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className={`relative flex flex-col border-r border-[rgba(61,220,132,0.08)] bg-[rgba(11,15,12,0.8)] backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[rgba(61,220,132,0.08)] px-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-3 group">
            <img src={logoUrl} alt={panelName} className="h-9 w-9 rounded-xl object-contain" />
            <div>
              <div className="text-sm font-bold tracking-wide gradient-text">{panelName}</div>
              <div className="text-[8px] font-semibold gradient-text-gold tracking-[0.2em] uppercase">Minecraft Hosting</div>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <img src={logoUrl} alt={panelName} className="h-9 w-9 rounded-xl object-contain" />
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-[rgba(245,247,245,0.4)] hover:bg-[rgba(61,220,132,0.08)] hover:text-[#3DDC84] transition-all">
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
                  ? "bg-[rgba(61,220,132,0.1)] text-[#3DDC84]"
                  : "text-[rgba(245,247,245,0.5)] hover:bg-[rgba(61,220,132,0.06)] hover:text-[rgba(245,247,245,0.9)]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-[#3DDC84]" />
              )}
              <item.icon size={18} className={isActive ? "text-[#3DDC84]" : "text-[rgba(245,247,245,0.3)]"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Credits Badge */}
      {credits !== null && !collapsed && (
        <div className="border-t border-[rgba(61,220,132,0.08)] px-3 py-3">
          <Link href="/credits" className="flex items-center gap-2 rounded-xl bg-[rgba(61,220,132,0.08)] border border-[rgba(61,220,132,0.12)] px-3 py-2 hover:bg-[rgba(61,220,132,0.15)] transition-colors">
            <Coins size={14} className="text-[#3DDC84]" />
            <span className="text-xs font-semibold text-[#3DDC84]">{credits.toLocaleString()}</span>
            <span className="text-[10px] text-[rgba(61,220,132,0.5)]">credits</span>
          </Link>
        </div>
      )}

      {/* Support */}
      <div className="border-t border-[rgba(61,220,132,0.08)] p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-[rgba(61,220,132,0.06)] border border-[rgba(61,220,132,0.1)] p-4">
            <p className="text-xs font-semibold text-[#3DDC84] mb-1">Need help?</p>
            <p className="text-[10px] text-[rgba(245,247,245,0.4)]">Our jungle guides are ready</p>
            <Link href="/tickets/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[rgba(61,220,132,0.1)] px-3 py-1.5 text-[11px] font-medium text-[#3DDC84] hover:bg-[rgba(61,220,132,0.2)] transition-colors"
            >
              <Ticket size={12} /> Open Ticket
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link href="/tickets/new"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(61,220,132,0.1)] text-[#3DDC84] hover:bg-[rgba(61,220,132,0.2)] transition-colors"
            >
              <Ticket size={16} />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
