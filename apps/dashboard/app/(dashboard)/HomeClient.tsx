"use client";

import { motion } from "framer-motion";
import { Server, Users, AlertTriangle, Activity, Plus } from "lucide-react";
import Link from "next/link";
import type { ServerCardData, ActivityItem } from "@/src/types/dashboard";

interface HomeClientProps {
  user: any;
  overview: {
    summary: { totalServers: number; activeServers: number; alerts: number; userServers: number; uptime: string };
    graphs: { cpu: { label: string; value: number }[]; ram: { label: string; value: number }[]; storage: { label: string; value: number }[] };
  };
  servers: ServerCardData[];
  activity: ActivityItem[];
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function HomeClient({ user, overview, servers, activity }: HomeClientProps) {
  const stats = [
    { label: "Your Servers", value: overview.summary.userServers, icon: Server, color: "from-ryzen-500 to-emerald-600", bg: "bg-ryzen-500/10" },
    { label: "Active", value: overview.summary.activeServers, icon: Activity, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
    { label: "Total Servers", value: overview.summary.totalServers, icon: Users, color: "from-violet-500 to-purple-500", bg: "bg-violet-500/10" },
    { label: "Active Alerts", value: overview.summary.alerts, icon: AlertTriangle, color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-6">
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/50 p-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-emerald-600/20 border border-ryzen-500/20">
                <Activity size={28} className="text-ryzen-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back{user ? `, ${user.username}` : ""}</h1>
                <p className="text-sm text-slate-400 mt-1">Here&apos;s what&apos;s happening with your servers</p>
              </div>
            </div>
            <Link href="/create-server" className="btn-primary">
              <Plus size={16} /> Create Server
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card glass-hover group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`rounded-xl ${stat.bg} p-2.5`}>
                <stat.icon size={20} className="text-slate-400" />
              </div>
            </div>
            <div className={`mt-4 h-1 w-full rounded-full bg-slate-800`}>
              <div className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`} style={{ width: `${Math.min(100, (stat.value / 10) * 100)}%` }} />
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Your Servers</h2>
              <p className="text-xs text-slate-400">Recently active servers</p>
            </div>
            <Link href="/my-servers" className="text-xs font-medium text-ryzen-400 hover:text-ryzen-300">View all</Link>
          </div>
          {servers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Server size={40} className="text-slate-700 mb-4" />
              <p className="text-sm font-medium text-slate-400">No servers yet</p>
              <p className="text-xs text-slate-500 mt-1">Create your first server to get started</p>
              <Link href="/create-server" className="btn-primary mt-4">
                <Plus size={14} /> Create Server
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {servers.slice(0, 5).map((s) => (
                <Link key={s.id} href={`/server/${s.id}`} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3 hover:bg-slate-700/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${s.status === "online" ? "bg-ryzen-400" : s.status === "offline" ? "bg-red-400" : "bg-yellow-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-ryzen-400 transition-colors">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.node} • {s.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{s.cpu}% CPU</span>
                    <span>{s.ram}MB RAM</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-400">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-slate-800/20 transition-colors">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                    a.status === "success" ? "bg-ryzen-400" : a.status === "warning" ? "bg-yellow-400" : "bg-red-400"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-500">{new Date(a.time).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
