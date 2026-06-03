"use client";

import { motion } from "framer-motion";
import {
  Server, Activity, Plus, Wifi, HardDrive, MemoryStick,
  Zap, ArrowRight, Globe, Cpu, Sword, Shield, Diamond,
  Pickaxe, Sparkles, Users,
} from "lucide-react";
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
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 15 } } };

const blockIcons = [
  { icon: Diamond, rarity: "legendary", label: "Premium" },
  { icon: Sword, rarity: "rare", label: "Combat Ready" },
  { icon: Shield, rarity: "uncommon", label: "Protected" },
  { icon: Pickaxe, rarity: "common", label: "Mining" },
];

export function HomeClient({ user, overview, servers, activity }: HomeClientProps) {
  const stats = [
    {
      label: "Your Servers", value: overview.summary.userServers, icon: Server,
      bg: "bg-ryzen-500/10", border: "border-ryzen-500/20",
      blockClass: "mc-block mc-block-redstone", desc: "Total owned",
      emoji: "⚔️",
    },
    {
      label: "Active Now", value: overview.summary.activeServers, icon: Wifi,
      bg: "bg-emerald-500/10", border: "border-emerald-500/20",
      blockClass: "mc-block mc-block-grass", desc: "Running servers",
      emoji: "🟢",
    },
    {
      label: "Total Capacity", value: overview.summary.totalServers, icon: Globe,
      bg: "bg-violet-500/10", border: "border-violet-500/20",
      blockClass: "mc-block mc-block-diamond", desc: "Across all nodes",
      emoji: "💎",
    },
    {
      label: "Uptime", value: overview.summary.uptime || "99.9%", icon: Activity,
      bg: "bg-amber-500/10", border: "border-amber-500/20",
      blockClass: "mc-block mc-block-gold", desc: "Service level",
      emoji: "⭐",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-6">
      {/* Hero Banner */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 ryzen-glow">
          {/* Animated decorative blocks */}
          <div className="absolute -top-10 -right-10 w-40 h-40 opacity-[0.04]">
            <div className="mc-block mc-block-diamond w-full h-full text-6xl flex items-center justify-center">◆</div>
          </div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 opacity-[0.03] rotate-45">
            <div className="mc-block mc-block-gold w-full h-full text-5xl flex items-center justify-center">★</div>
          </div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 opacity-[0.02] animate-float">
            <div className="mc-block mc-block-redstone w-full h-full text-4xl flex items-center justify-center">⬡</div>
          </div>

          <div className="relative p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
                  <Zap size={32} className="text-ryzen-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back{user ? `, ${user.username}` : ""}
                    <span className="inline-block ml-2 animate-block-bounce">⛏️</span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-ryzen-400 animate-pulse-glow" />
                      <span className="rarity-uncommon font-medium">All systems nominal</span>
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1">
                      <span>🟢</span>
                      {overview.summary.activeServers} server{overview.summary.activeServers !== 1 ? "s" : ""} running
                    </span>
                  </p>
                </div>
              </div>
              <Link href="/create-server" className="btn-primary group">
                <Plus size={16} />
                <span>Create Server</span>
                <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 hover:border-slate-600/50 hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${stat.bg} blur-xl group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1">
                      <span>{stat.emoji}</span> {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white font-mono tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">{stat.desc}</p>
                  </div>
                  <div className={`rounded-xl ${stat.bg} ${stat.border} border p-3 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                    <Icon size={22} className="text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Your Servers */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="mc-block mc-block-diamond">
                  <Diamond size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Servers</h2>
                  <p className="text-xs text-slate-500">Recently active servers</p>
                </div>
              </div>
              <Link href="/my-servers" className="text-xs font-medium text-ryzen-400 hover:text-ryzen-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {servers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-5 relative">
                  <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-slate-800/50 border border-slate-700/30">
                    <Pickaxe size={36} className="text-slate-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-lg animate-float">⛏️</span>
                </div>
                <p className="text-base font-semibold text-slate-300">No servers yet</p>
                <p className="text-sm text-slate-500 mt-1">Deploy your first Minecraft server</p>
                <Link href="/create-server" className="btn-primary mt-6">
                  <Plus size={16} /> Create Server
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {servers.slice(0, 5).map((s, i) => (
                  <Link key={s.id} href={`/server/${s.id}`}
                    className="flex items-center justify-between rounded-xl bg-slate-800/20 px-4 py-3.5 hover:bg-slate-800/40 hover:border hover:border-slate-700/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`mc-block ${s.status === "online" ? "mc-block-grass" : "mc-block-stone"} w-9 h-9`}>
                        <span className="text-white text-sm font-bold relative z-10">{s.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-ryzen-400 transition-colors">{s.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className={`flex items-center gap-1 ${s.status === "online" ? "text-emerald-400" : "text-slate-500"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.status === "online" ? "bg-emerald-400" : "bg-slate-600"}`} />
                            {s.status}
                          </span>
                          <span>•</span>
                          <span>{s.node}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-800/40 px-2 py-0.5 rounded-md"><Cpu size={10} /> {s.cpu}%</span>
                        <span className="flex items-center gap-1 bg-slate-800/40 px-2 py-0.5 rounded-md"><MemoryStick size={10} /> {s.ram >= 1024 ? `${(s.ram / 1024).toFixed(1)}G` : `${s.ram}M`}</span>
                        <span className="flex items-center gap-1 bg-slate-800/40 px-2 py-0.5 rounded-md"><HardDrive size={10} /> {s.disk >= 1024 ? `${(s.disk / 1024).toFixed(1)}G` : `${s.disk}M`}</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-ryzen-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={item}>
          <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="mc-block mc-block-gold">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Activity</h2>
                <p className="text-xs text-slate-500">Recent actions</p>
              </div>
            </div>

            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-800/30 mb-3">
                  <Activity size={28} className="text-slate-700" />
                </div>
                <p className="text-sm text-slate-400">No activity yet</p>
                <p className="text-[11px] text-slate-600 mt-1">Actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activity.slice(0, 10).map((a, i) => (
                  <div key={a.id}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-800/20 transition-colors"
                  >
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                      a.status === "SUCCESS" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" :
                      a.status === "WARNING" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" :
                      "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-300 truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-600">{new Date(a.time).toLocaleDateString()}</p>
                        {a.serverName && (
                          <>
                            <span className="text-slate-700">•</span>
                            <span className="text-[10px] text-slate-600 truncate">{a.serverName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div variants={item}>
        <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/60 to-slate-900/20 p-4">
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-ryzen-400" /> Powered by <strong className="text-ryzen-400">RYZENPANEL</strong></span>
            <span className="flex items-center gap-1.5"><Sword size={12} className="text-slate-600" /> {overview.summary.totalServers} servers deployed</span>
            <span className="flex items-center gap-1.5"><Users size={12} className="text-slate-600" /> {overview.summary.activeServers} players online</span>
            <span className="flex items-center gap-1.5"><Pickaxe size={12} className="text-slate-600" /> {overview.summary.userServers} your servers</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
