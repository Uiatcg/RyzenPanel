"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Server, Plus, Search, HardDrive, MemoryStick, Cpu,
  Globe, ChevronRight, Diamond, Sword, Shield, Pickaxe,
  Zap,
} from "lucide-react";
import type { ServerCardData } from "@/src/types/dashboard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const statusConfig: Record<string, { dot: string; label: string; block: string }> = {
  online: { dot: "bg-emerald-400", label: "Online", block: "mc-block-grass" },
  offline: { dot: "bg-slate-600", label: "Offline", block: "mc-block-stone" },
  running: { dot: "bg-emerald-400", label: "Running", block: "mc-block-grass" },
  installing: { dot: "bg-amber-400", label: "Installing", block: "mc-block-gold" },
};

function getRarity(name: string): { label: string; color: string; border: string; bg: string; icon: any } {
  const hash = name.length + name.charCodeAt(0);
  if (hash % 5 === 0) return { label: "Legendary", color: "text-amber-400", border: "border-amber-400/30", bg: "bg-amber-400/5", icon: Diamond };
  if (hash % 5 === 1) return { label: "Epic", color: "text-purple-400", border: "border-purple-400/30", bg: "bg-purple-400/5", icon: Sword };
  if (hash % 5 === 2) return { label: "Rare", color: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/5", icon: Shield };
  if (hash % 5 === 3) return { label: "Uncommon", color: "text-cyan-400", border: "border-cyan-400/30", bg: "bg-cyan-400/5", icon: Pickaxe };
  return { label: "Common", color: "text-slate-400", border: "border-slate-400/20", bg: "bg-slate-400/5", icon: Server };
}

export default function MyServersPage() {
  const [servers, setServers] = useState<ServerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/servers").then(r => r.json()).then(d => {
      setServers(d.servers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = servers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-48 rounded-3xl" />
        <div className="skeleton h-12 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-6">
      {/* Banner */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 ryzen-glow">
          <div className="absolute -top-16 -right-16 w-48 h-48 opacity-[0.04]">
            <div className="mc-block mc-block-diamond w-full h-full text-7xl flex items-center justify-center rotate-12">◆</div>
          </div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 opacity-[0.03] -rotate-12">
            <div className="mc-block mc-block-gold w-full h-full text-6xl flex items-center justify-center">★</div>
          </div>
          <div className="relative p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
                  <Server size={30} className="text-ryzen-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">My Servers</h1>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                    <span>{servers.length} server{servers.length !== 1 ? "s" : ""} deployed</span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {servers.filter(s => s.status === "online" || s.status === "running").length} active
                    </span>
                  </p>
                </div>
              </div>
              <Link href="/create-server" className="btn-primary group">
                <Plus size={16} />
                <span>New Server</span>
                <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 bg-slate-900/60 border-slate-700/30 focus:border-ryzen-500/30"
          placeholder="🔍 Search servers by name..." />
      </motion.div>

      {/* Server Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item}
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/60 to-slate-900/20"
        >
          <div className="w-24 h-24 flex items-center justify-center rounded-2xl bg-slate-800/50 border border-slate-700/30 mb-5 relative">
            <Pickaxe size={40} className="text-slate-600" />
            <span className="absolute -top-1 -right-1 text-lg animate-float">💎</span>
          </div>
          <p className="text-lg font-semibold text-slate-300">
            {servers.length === 0 ? "No servers deployed!" : "No servers match your search"}
          </p>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {servers.length === 0 ? "Create your first Minecraft server to start playing" : "Try a different search query"}
          </p>
          {servers.length === 0 && (
            <Link href="/create-server" className="btn-primary">
              <Plus size={16} /> Create Server
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => {
            const rarity = getRarity(s.name);
            const RarityIcon = rarity.icon;
            const status = statusConfig[s.status] || statusConfig.offline;
            return (
              <Link key={s.id} href={`/server/${s.id}`}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 hover:shadow-lg transition-all duration-300 ${rarity.border} hover:${rarity.border.replace("20", "40").replace("30", "50")}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Rarity glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${rarity.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full ${rarity.bg} blur-xl`} />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`mc-block ${status.block} w-11 h-11`}>
                      <span className="text-white text-base font-bold relative z-10">{s.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${rarity.color}`}>
                        {rarity.label}
                      </span>
                      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        s.status === "online" || s.status === "running"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800/50 text-slate-500 border-slate-700/30"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Name + Node */}
                  <h3 className="text-base font-semibold text-white group-hover:text-ryzen-400 transition-colors">{s.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Globe size={11} />
                    <span className="truncate">{s.node || "local"}</span>
                    {s.ip && <><span className="text-slate-700">•</span><span className="truncate">{s.ip}</span></>}
                  </div>

                  {/* Resource Metrics */}
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { label: "CPU", value: `${s.cpu}%`, icon: Cpu, color: "text-ryzen-400" },
                      { label: "RAM", value: s.ram >= 1024 ? `${(s.ram / 1024).toFixed(1)}G` : `${s.ram}M`, icon: MemoryStick, color: "text-emerald-400" },
                      { label: "Disk", value: s.disk >= 1024 ? `${(s.disk / 1024).toFixed(1)}G` : `${s.disk}M`, icon: HardDrive, color: "text-cyan-400" },
                    ].map(m => {
                      const MIcon = m.icon;
                      return (
                        <div key={m.label} className="rounded-xl bg-slate-800/40 border border-slate-700/20 px-2.5 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500 mb-1">
                            <MIcon size={9} className={m.color} /> {m.label}
                          </div>
                          <p className={`text-xs font-bold ${m.color}`}>{m.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rarity indicator */}
                  <div className="mt-3 flex items-center gap-1">
                    <RarityIcon size={10} className={rarity.color} />
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${rarity.color}`}>{rarity.label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
