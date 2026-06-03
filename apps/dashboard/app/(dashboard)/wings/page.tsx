"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Wifi, WifiOff, HardDrive, Cpu, MemoryStick,
  Globe, Server, RefreshCw, Terminal, Copy, Check,
  ExternalLink, Activity, AlertTriangle, Zap, Diamond,
} from "lucide-react";

interface WingsNode {
  id: string; uuid: string; name: string; description?: string;
  location: string; fqdn: string; ip: string;
  status: string; daemonPort: number;
  maxRam: number; maxDisk: number; maxServers: number;
  memoryUsed: number; diskUsed: number;
  lastHeartbeat?: string; createdAt: string;
  _count: { servers: number; allocations: number };
  metrics?: { cpuPercent: number; memoryUsed: string; memoryTotal: string; diskUsed: string; diskTotal: string; dockerRunning: number } | null;
}

export default function WingsPage() {
  const [nodes, setNodes] = useState<WingsNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<WingsNode | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchNodes = useCallback(() => {
    setLoading(true);
    fetch("/api/wings").then(r => r.json()).then(d => {
      setNodes(d.nodes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);
  useEffect(() => { const i = setInterval(fetchNodes, 15000); return () => clearInterval(i); }, [fetchNodes]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const onlineNodes = nodes.filter(n => n.status === "online");
  const offlineNodes = nodes.filter(n => n.status !== "online");

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
              <Radio size={26} className="text-ryzen-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Wings</h1>
              <p className="text-sm text-slate-400">Manage your Wings daemon nodes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-ryzen-500/10 px-4 py-2 border border-ryzen-500/20">
              <Wifi size={14} className="text-ryzen-400" />
              <span className="text-sm font-semibold text-ryzen-400">{onlineNodes.length} Online</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/50 px-4 py-2 border border-slate-700/30">
              <Server size={14} className="text-slate-400" />
              <span className="text-sm text-slate-400">{nodes.length} Total</span>
            </div>
            <button onClick={fetchNodes}
              className="flex items-center gap-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 hover:bg-slate-800/50 transition-all">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : nodes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/60 to-slate-900/20"
        >
          <div className="w-24 h-24 flex items-center justify-center rounded-3xl bg-slate-800/50 border border-slate-700/30 mb-6 relative">
            <Radio size={40} className="text-ryzen-400" />
            <span className="absolute -top-1 -right-1 text-lg animate-float">💎</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Wings Connected</h2>
          <p className="text-sm text-slate-400 max-w-md text-center">
            Wings nodes are the machines that run your game servers. 
            Add a node in the admin panel to connect a Wings daemon.
          </p>
          <a href="/admin/nodes" className="btn-primary mt-6">
            <HardDrive size={16} /> Go to Admin Nodes
          </a>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...onlineNodes, ...offlineNodes].map((node) => {
            const isOnline = node.status === "online";
            return (
              <motion.div key={node.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 transition-all duration-300 hover:shadow-lg ${
                  isOnline ? "border-emerald-500/20 hover:border-emerald-500/30" : "border-slate-700/30 hover:border-slate-600/50"
                } ${selectedNode?.id === node.id ? "ring-1 ring-ryzen-500/30" : ""}`}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`mc-block ${isOnline ? "mc-block-grass" : "mc-block-stone"} w-10 h-10`}>
                      <Radio size={20} className="text-white relative z-10" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{node.name}</p>
                      <p className="text-[10px] text-slate-500">{node.location} • {node.fqdn}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700/30"
                  }`}>
                    {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {node.status}
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-slate-800/40 border border-slate-700/20 px-3 py-2 text-center">
                    <p className="text-xs font-bold text-white">{node._count.servers}</p>
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5"><Server size={9} /> Servers</p>
                  </div>
                  <div className="rounded-xl bg-slate-800/40 border border-slate-700/20 px-3 py-2 text-center">
                    <p className="text-xs font-bold text-white">{node.metrics?.dockerRunning ?? node._count.servers}</p>
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5"><Terminal size={9} /> Running</p>
                  </div>
                  <div className="rounded-xl bg-slate-800/40 border border-slate-700/20 px-3 py-2 text-center">
                    <p className="text-xs font-bold text-white">{node.maxServers}</p>
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5"><Globe size={9} /> Max</p>
                  </div>
                </div>

                {/* Resource bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><MemoryStick size={9} className="text-ryzen-400" /> RAM</span>
                      <span>{node.memoryUsed >= 1024 ? `${(node.memoryUsed / 1024).toFixed(1)}G` : `${node.memoryUsed}M`} / {node.maxRam >= 1024 ? `${(node.maxRam / 1024).toFixed(0)}G` : `${node.maxRam}M`}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-ryzen-500 to-red-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (node.memoryUsed / node.maxRam) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><HardDrive size={9} className="text-cyan-400" /> Disk</span>
                      <span>{node.diskUsed >= 1024 ? `${(node.diskUsed / 1024).toFixed(1)}G` : `${node.diskUsed}M`} / {node.maxDisk >= 1024 ? `${(node.maxDisk / 1024).toFixed(0)}G` : `${node.maxDisk}M`}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (node.diskUsed / node.maxDisk) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
