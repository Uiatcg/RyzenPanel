"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Server, Plus, Search, Wifi, HardDrive, MemoryStick } from "lucide-react";
import type { ServerCardData } from "@/src/types/dashboard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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
        <div className="skeleton h-48" />
        <div className="skeleton h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-emerald-600/20 border border-ryzen-500/20">
              <Server size={28} className="text-ryzen-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Servers</h1>
              <p className="text-sm text-slate-400 mt-1">Manage all your Minecraft servers</p>
            </div>
          </div>
          <Link href="/create-server" className="btn-primary">
            <Plus size={16} /> New Server
          </Link>
        </div>
      </div>

      <motion.div variants={item} className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search servers..." />
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-20 card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/10 to-emerald-600/10 mb-4">
            <Server size={32} className="text-ryzen-400" />
          </div>
          <p className="text-lg font-medium text-slate-400">{servers.length === 0 ? "No servers yet" : "No servers match your search"}</p>
          <p className="text-sm text-slate-500 mt-1">Create your first server to get started</p>
          <Link href="/create-server" className="btn-primary mt-6">
            <Plus size={16} /> Create Server
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => (
            <Link key={s.id} href={`/server/${s.id}`} className="card glass-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold
                  ${s.status === "online" ? "bg-ryzen-500/10 text-ryzen-400" : "bg-slate-700/30 text-slate-500"}`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className={`badge ${s.status === "online" ? "badge-green" : s.status === "offline" ? "badge-red" : "badge-yellow"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    s.status === "online" ? "bg-ryzen-400" : s.status === "offline" ? "bg-red-400" : "bg-yellow-400"
                  }`} />
                  {s.status}
                </div>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-ryzen-400 transition-colors">{s.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{s.node} &middot; {s.ip}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-800/30 p-2">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                    <Wifi size={10} /> CPU
                  </div>
                  <p className="text-sm font-semibold text-white">{s.cpu}%</p>
                </div>
                <div className="rounded-lg bg-slate-800/30 p-2">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                    <MemoryStick size={10} /> RAM
                  </div>
                  <p className="text-sm font-semibold text-white">{s.ram >= 1024 ? `${(s.ram / 1024).toFixed(1)}G` : `${s.ram}M`}</p>
                </div>
                <div className="rounded-lg bg-slate-800/30 p-2">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                    <HardDrive size={10} /> Disk
                  </div>
                  <p className="text-sm font-semibold text-white">{s.disk >= 1024 ? `${(s.disk / 1024).toFixed(1)}G` : `${s.disk}M`}</p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
