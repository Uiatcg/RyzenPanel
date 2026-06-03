"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Server, HardDrive, Ticket, CreditCard, Activity, Shield, Zap } from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Total Servers", value: stats.totalServers || 0, icon: Server, color: "from-ryzen-500 to-red-600" },
    { label: "Nodes", value: stats.totalNodes || 0, icon: HardDrive, color: "from-violet-500 to-purple-500" },
    { label: "Open Tickets", value: stats.openTickets || 0, icon: Ticket, color: "from-amber-500 to-orange-500" },
    { label: "Revenue", value: stats.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00", icon: CreditCard, color: "from-pink-500 to-rose-500" },
    { label: "Active Servers", value: stats.activeServers || 0, icon: Activity, color: "from-ryzen-500 to-red-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-red-600/5 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
            <Shield size={30} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your hosting platform</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 hover:border-slate-600/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className={`rounded-lg p-2 bg-gradient-to-r ${card.color} group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white font-mono">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
