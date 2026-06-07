"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Users, Server, HardDrive, Globe, Ticket,
  CreditCard, Percent, Megaphone, Database, Palette,
  ToggleLeft, ShieldCheck,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: Shield, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/servers", label: "Servers", icon: Server },
  { href: "/admin/nodes", label: "Nodes", icon: HardDrive },
  { href: "/admin/allocations", label: "Allocations", icon: Globe },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/invoices", label: "Invoices", icon: CreditCard },
  { href: "/admin/coupons", label: "Coupons", icon: Percent },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/backups", label: "Backups", icon: Database },
  { href: "/admin/settings", label: "Brand Settings", icon: Palette },
  { href: "/admin/permissions", label: "Permissions", icon: ShieldCheck },
  { href: "/admin/toggles", label: "Feature Toggles", icon: ToggleLeft },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.json()).then(d => {
      if (d?.user?.role !== "ADMIN") router.push("/");
      else setIsAdmin(true);
      setChecking(false);
    }).catch(() => { router.push("/auth/login"); setChecking(false); });
  }, [router]);

  if (checking) return <div className="p-6"><div className="skeleton h-96" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-full">
      <aside className="w-56 flex-shrink-0 border-r border-slate-800/50 p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield size={16} className="text-ryzen-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Panel</span>
        </div>
        <nav className="space-y-1">
          {adminLinks.map(link => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive ? "bg-ryzen-500/10 text-ryzen-400" : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                }`}
              >
                <link.icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
