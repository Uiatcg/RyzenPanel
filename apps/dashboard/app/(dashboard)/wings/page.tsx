"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Wifi, WifiOff, HardDrive, Cpu, MemoryStick,
  Globe, Server, RefreshCw, Terminal, Copy, Check,
  ExternalLink, Activity, AlertTriangle, Zap, Clock,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-emerald-600/20 border border-ryzen-500/20">
                <Radio size={24} className="text-ryzen-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Wings</h1>
                <p className="text-sm text-slate-400">Manage your Wings daemon nodes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 rounded-xl bg-ryzen-500/10 px-4 py-2">
                <Wifi size={14} className="text-ryzen-400" />
                <span className="text-sm font-semibold text-ryzen-400">{onlineNodes.length} Online</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-800/50 px-4 py-2">
                <Server size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">{nodes.length} Total Nodes</span>
              </div>
              <button onClick={fetchNodes} className="btn-ghost text-xs">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : nodes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-ryzen-500/10 to-emerald-600/10 mb-6">
            <Radio size={40} className="text-ryzen-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Wings Connected</h2>
          <p className="text-sm text-slate-400 max-w-md">
            Wings nodes are the machines that run your game servers. 
            Add a node in the admin panel to connect a Wings daemon.
          </p>
          <a href="/admin/nodes" className="btn-primary mt-6">
            <HardDrive size={16} /> Go to Admin Nodes
          </a>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nodes.map((node, idx) => (
              <motion.div key={node.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="card relative overflow-hidden group cursor-pointer hover:border-slate-700/50 transition-all"
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2.5 ${node.status === "online" ? "bg-ryzen-500/10" : "bg-slate-800"}`}>
                        <Radio size={18} className={node.status === "online" ? "text-ryzen-400" : "text-slate-500"} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{node.name}</p>
                        <p className="text-[10px] text-slate-500">{node.location} &middot; {node.fqdn}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      node.status === "online" ? "bg-ryzen-500/10 text-ryzen-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {node.status === "online" ? <Wifi size={10} /> : <WifiOff size={10} />}
                      {node.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg bg-slate-800/30 p-2.5 text-center">
                      <Server size={14} className="mx-auto text-slate-500 mb-1" />
                      <p className="text-xs font-bold text-white">{node._count.servers}</p>
                      <p className="text-[10px] text-slate-500">Servers</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/30 p-2.5 text-center">
                      <Globe size={14} className="mx-auto text-slate-500 mb-1" />
                      <p className="text-xs font-bold text-white">{node.daemonPort}</p>
                      <p className="text-[10px] text-slate-500">Port</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/30 p-2.5 text-center">
                      <Activity size={14} className="mx-auto text-slate-500 mb-1" />
                      <p className="text-xs font-bold text-white">{node._count.allocations}</p>
                      <p className="text-[10px] text-slate-500">Allocs</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span><MemoryStick size={10} className="inline mr-1" />RAM</span>
                        <span>{node.memoryUsed >= 1024 ? `${(node.memoryUsed / 1024).toFixed(1)} GB` : `${node.memoryUsed} MB`} / {node.maxRam >= 1024 ? `${(node.maxRam / 1024).toFixed(0)} GB` : `${node.maxRam} MB`}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (node.memoryUsed / Math.max(node.maxRam, 1)) * 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span><HardDrive size={10} className="inline mr-1" />Disk</span>
                        <span>{node.diskUsed >= 1024 ? `${(node.diskUsed / 1024).toFixed(1)} GB` : `${node.diskUsed} MB`} / {node.maxDisk >= 1024 ? `${(node.maxDisk / 1024).toFixed(0)} GB` : `${node.maxDisk} MB`}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (node.diskUsed / Math.max(node.maxDisk, 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {node.lastHeartbeat && (
                    <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1">
                      <Clock size={10} />
                      Last seen: {new Date(node.lastHeartbeat).toLocaleString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {selectedNode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="card border-ryzen-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-ryzen-500/10 p-2.5">
                      <Terminal size={20} className="text-ryzen-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Connect Wings - {selectedNode.name}</h3>
                      <p className="text-xs text-slate-500">Install and connect a Wings daemon to this node</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="btn-ghost text-xs">Close</button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/30 p-4">
                    <p className="text-xs font-medium text-slate-400 mb-3">Node Information</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        ["Node ID", selectedNode.uuid],
                        ["Node Name", selectedNode.name],
                        ["FQDN", selectedNode.fqdn],
                        ["IP Address", selectedNode.ip],
                        ["Daemon Port", String(selectedNode.daemonPort)],
                        ["Status", selectedNode.status],
                        ["Location", selectedNode.location.toUpperCase()],
                        ["Max Servers", String(selectedNode.maxServers)],
                      ].map(([l, v]) => (
                        <div key={l as string} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                          <span className="text-slate-500">{l as string}</span>
                          <span className="font-mono text-slate-300 truncate ml-2">{v as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-2">Install Wings Daemon</p>
                    <div className="relative">
                      <pre className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-ryzen-400 overflow-x-auto whitespace-pre-wrap">
                        <code>{`# Install Wings on your VPS:
curl -sSL https://install.ryzenpanel.com/wings.sh | bash

# Then configure and start:
export PANEL_URL="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}"
export NODE_ID="${selectedNode.uuid}"
export NODE_TOKEN="${selectedNode.uuid}"
export DAEMON_API_KEY="${selectedNode.uuid}"
wings --config /etc/ryzenpanel/config.yml`}</code>
                      </pre>
                      <button onClick={() => copyToClipboard(`curl -sSL https://install.ryzenpanel.com/wings.sh | bash -s -- --panel-url="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}" --node-id="${selectedNode.uuid}" --node-token="${selectedNode.uuid}"`)}
                        className="absolute top-2 right-2 rounded-lg bg-slate-800 p-2 hover:bg-slate-700 transition-colors">
                        {copied ? <Check size={14} className="text-ryzen-400" /> : <Copy size={14} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-yellow-400">Important</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Make sure port {selectedNode.daemonPort} is open on your firewall. 
                          The Wings daemon must be able to reach this panel at {process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
