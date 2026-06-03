"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, HardDrive, Wifi, WifiOff, X, Copy, Check,
  Edit3, Trash2, RefreshCw, Server, Network, Terminal,
  MoreVertical, AlertTriangle, Radio, MemoryStick,
} from "lucide-react";

interface NodeData {
  id: string; uuid: string; name: string; description?: string;
  location: string; fqdn: string; ip: string; isPublic: boolean;
  status: string; daemonPort: number; maxRam: number; maxDisk: number;
  maxServers: number; memoryUsed: number; diskUsed: number;
  allocateMemory: number; allocateDisk: number;
  lastHeartbeat?: string; createdAt: string;
  daemonKey: string; nodeSecret: string;
  _count: { servers: number; allocations: number };
  metrics?: { cpuPercent: number; memoryUsed: string; memoryTotal: string; diskUsed: string; diskTotal: string; dockerRunning: number } | null;
}

const defaultForm = {
  name: "", description: "", location: "us-east", fqdn: "", ip: "",
  daemonPort: 8080, maxRam: 65536, maxDisk: 512000, maxServers: 5, isPublic: true,
};

export default function AdminNodesPage() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [showInstall, setShowInstall] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [panelOrigin, setPanelOrigin] = useState("https://YOUR_PANEL_URL");

  useEffect(() => {
    setPanelOrigin(window.location.origin);
  }, []);

  function getStartCommand(node: any) {
    return `cd ryzenpanel/daemon && export DAEMON_API_KEY="${node.daemonKey || node.apiKey}" DAEMON_FQDN="${node.fqdn || node.ip}" PANEL_URL="${panelOrigin}" NODE_ID="${node.uuid || node.nodeId}" NODE_TOKEN="${node.nodeSecret || node.token}" && nohup node dist/index.js > /tmp/ryzen-daemon.log 2>&1 &`;
  }
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const fetchNodes = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/nodes").then(r => r.json()).then(d => {
      setNodes(d.nodes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);

  function openEdit(node: NodeData) {
    setForm({
      name: node.name, description: node.description || "",
      location: node.location, fqdn: node.fqdn, ip: node.ip,
      daemonPort: node.daemonPort, maxRam: node.maxRam,
      maxDisk: node.maxDisk, maxServers: node.maxServers, isPublic: node.isPublic,
    });
    setEditingNode(node);
    setShowForm(true);
  }

  function openCreate() {
    setForm(defaultForm);
    setEditingNode(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingNode ? `/api/admin/nodes/${editingNode.id}` : "/api/admin/nodes";
    const method = editingNode ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      if (!editingNode) {
        const data = await res.json();
        setShowInstall(data);
      }
      setShowForm(false);
      setEditingNode(null);
      fetchNodes();
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/nodes/${id}`, { method: "DELETE" });
    setShowDelete(null);
    fetchNodes();
  }

  async function handleAction(id: string, action: string) {
    await fetch(`/api/admin/nodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchNodes();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
              <HardDrive size={26} className="text-ryzen-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nodes</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage Wings daemon server nodes</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={14} /> Add Node
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/60 to-slate-900/20">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-slate-800/50 border border-slate-700/30 mb-4">
            <HardDrive size={48} className="text-slate-600" />
          </div>
          <p className="text-lg font-semibold text-slate-300">No nodes configured</p>
          <p className="text-sm text-slate-500 mt-1">Add your first node to start deploying servers</p>
          <button onClick={openCreate} className="btn-primary mt-6">
            <Plus size={16} /> Add Node
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => (
            <motion.div key={node.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 hover:border-slate-600/50 hover:shadow-lg transition-all duration-300 group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-ryzen-500/5 to-transparent rounded-full blur-2xl" />
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${node.status === "online" ? "bg-ryzen-500/10 ring-1 ring-ryzen-500/20" : "bg-slate-800"}`}>
                    <HardDrive size={18} className={node.status === "online" ? "text-ryzen-400" : "text-slate-500"} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{node.name}</p>
                    <p className="text-[10px] text-slate-500">{node.location} • {node.fqdn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    node.status === "online" ? "bg-emerald-500/10 text-emerald-400" :
                    node.status === "offline" ? "bg-red-500/10 text-red-400" :
                    "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {node.status === "online" ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {node.status}
                  </div>
                    <div className="relative">
                    <button onClick={() => setShowDelete(showDelete === node.id ? null : node.id)}
                      className="p-1 rounded-lg hover:bg-slate-800 transition-colors">
                      <MoreVertical size={14} className="text-slate-500" />
                    </button>
                    {showDelete === node.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowDelete(null)} />
                        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl p-1 shadow-xl">
                          <button onClick={() => { openEdit(node); setShowDelete(null); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors">
                            <Edit3 size={12} /> Edit
                          </button>
                          <button onClick={() => {
                            setShowInstall(node);
                            setShowDelete(null);
                          }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors">
                            <Terminal size={12} /> Start Command
                          </button>
                          {node.status === "online" ? (
                            <button onClick={() => { handleAction(node.id, "suspend"); setShowDelete(null); }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                              <WifiOff size={12} /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => { handleAction(node.id, "unsuspend"); setShowDelete(null); }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ryzen-400 hover:bg-ryzen-500/10 transition-colors">
                              <Wifi size={12} /> Unsuspend
                            </button>
                          )}
                          <button onClick={() => { handleAction(node.id, "reset-token"); setShowDelete(null); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <RefreshCw size={12} /> Reset Token
                          </button>
                          <div className="border-t border-slate-800/50 my-1" />
                          <button onClick={() => { setShowDelete(node.id); handleDelete(node.id); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg bg-slate-800/30 px-3 py-2 text-center">
                  <p className="text-xs font-bold text-white">{node._count.servers}</p>
                  <p className="text-[10px] text-slate-500">Servers</p>
                </div>
                <div className="rounded-lg bg-slate-800/30 px-3 py-2 text-center">
                  <p className="text-xs font-bold text-white">{node._count.allocations}</p>
                  <p className="text-[10px] text-slate-500">Allocs</p>
                </div>
                <div className="rounded-lg bg-slate-800/30 px-3 py-2 text-center">
                  <p className="text-xs font-bold text-white">{node.maxServers}</p>
                  <p className="text-[10px] text-slate-500">Max</p>
                </div>
              </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><MemoryStick size={9} className="text-ryzen-400" /> RAM</span>
                      <span>{node.memoryUsed >= 1024 ? `${(node.memoryUsed / 1024).toFixed(1)} GB` : `${node.memoryUsed} MB`} / {node.maxRam >= 1024 ? `${(node.maxRam / 1024).toFixed(0)} GB` : `${node.maxRam} MB`}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-ryzen-500 to-red-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (node.memoryUsed / node.maxRam) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><HardDrive size={9} className="text-cyan-400" /> Disk</span>
                      <span>{node.diskUsed >= 1024 ? `${(node.diskUsed / 1024).toFixed(1)} GB` : `${node.diskUsed} MB`} / {node.maxDisk >= 1024 ? `${(node.maxDisk / 1024).toFixed(0)} GB` : `${node.maxDisk} MB`}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (node.diskUsed / node.maxDisk) * 100)}%` }} />
                    </div>
                  </div>
                </div>

              {node.lastHeartbeat && (
                <p className="text-[10px] text-slate-600 mt-2">
                  Last seen: {new Date(node.lastHeartbeat).toLocaleString()}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">{editingNode ? "Edit Node" : "Add Node"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingNode ? "Update node configuration" : "Create a new server node"}
                  </p>
                </div>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-400">Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="input-field mt-1" placeholder="US West Node 1" required />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-400">Description</label>
                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      className="input-field mt-1" placeholder="Primary US west coast node" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Location</label>
                    <select value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                      className="input-field mt-1">
                      <option value="us-east">US East</option>
                      <option value="us-west">US West</option>
                      <option value="eu-central">EU Central</option>
                      <option value="eu-west">EU West</option>
                      <option value="ap-southeast">Asia Pacific</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Daemon Port</label>
                    <input type="number" value={form.daemonPort} onChange={e => setForm({...form, daemonPort: Number(e.target.value)})}
                      className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">FQDN / IP</label>
                    <input value={form.fqdn} onChange={e => setForm({...form, fqdn: e.target.value})}
                      className="input-field mt-1" placeholder="node1.ryzenpanel.com" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">IP Address</label>
                    <input value={form.ip} onChange={e => setForm({...form, ip: e.target.value})}
                      className="input-field mt-1" placeholder="192.168.1.100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Memory (MB)</label>
                    <input type="number" value={form.maxRam} onChange={e => setForm({...form, maxRam: Number(e.target.value)})}
                      className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Disk (MB)</label>
                    <input type="number" value={form.maxDisk} onChange={e => setForm({...form, maxDisk: Number(e.target.value)})}
                      className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Max Servers</label>
                    <input type="number" value={form.maxServers} onChange={e => setForm({...form, maxServers: Number(e.target.value)})}
                      className="input-field mt-1" min={1} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Public</label>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})}
                          className="rounded border-slate-700 bg-slate-800 text-ryzen-500 focus:ring-ryzen-500/20" />
                        <span className="text-xs text-slate-400">Auto-deploy servers</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    {editingNode ? "Save Changes" : "Create Node"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowInstall(null); setCopied(false); }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-violet-500/10 p-2">
                    <Terminal size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Node Created</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Run this command on your server to install RyzenDaemon</p>
                  </div>
                </div>
                <button onClick={() => { setShowInstall(null); setCopied(false); }} className="btn-ghost p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/30 p-4">
                  <p className="text-xs font-medium text-slate-400 mb-2">Node Information</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      ["Node ID", showInstall.uuid],
                      ["Node Name", showInstall.name],
                      ["FQDN", showInstall.fqdn],
                      ["Daemon Port", String(showInstall.daemonPort)],
                    ].map(([l, v]) => (
                      <div key={l as string} className="flex justify-between py-1 px-2 rounded-lg bg-slate-900/50">
                        <span className="text-slate-500">{l as string}</span>
                        <span className="font-mono text-slate-300">{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Start Daemon Command</p>
                  <div className="relative">
                    <pre className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-ryzen-400 overflow-x-auto whitespace-pre-wrap break-all">
                      <code>{showInstall.startCommand || getStartCommand(showInstall)}</code>
                    </pre>
                    <button onClick={() => copyToClipboard(showInstall.startCommand || getStartCommand(showInstall))}
                      className="absolute top-2 right-2 rounded-lg bg-slate-800 p-2 hover:bg-slate-700 transition-colors">
                      {copied ? <Check size={14} className="text-ryzen-400" /> : <Copy size={14} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-yellow-400">Important</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Save the node credentials. The daemon will not connect without the Node Token and API Key.
                        You can reset them anytime from the node menu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowInstall(null); setCopied(false); }} className="btn-primary text-sm">
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}