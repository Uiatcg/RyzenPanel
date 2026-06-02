"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Server, HardDrive, Ticket, CreditCard, Activity, Shield } from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Total Servers", value: stats.totalServers || 0, icon: Server, color: "from-ryzen-500 to-emerald-600" },
    { label: "Nodes", value: stats.totalNodes || 0, icon: HardDrive, color: "from-violet-500 to-purple-500" },
    { label: "Open Tickets", value: stats.openTickets || 0, icon: Ticket, color: "from-amber-500 to-orange-500" },
    { label: "Revenue", value: stats.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00", icon: CreditCard, color: "from-pink-500 to-rose-500" },
    { label: "Active Servers", value: stats.activeServers || 0, icon: Activity, color: "from-ryzen-500 to-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-ryzen-950/40 border border-slate-800/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-emerald-600/20 border border-ryzen-500/20">
            <Shield size={28} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your hosting platform</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <motion.div key={card.label} whileHover={{ y: -2 }} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</span>
              <div className={`rounded-lg p-2 bg-gradient-to-r ${card.color}`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
