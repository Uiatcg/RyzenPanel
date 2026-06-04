"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Plus, Copy, Check, Shield, Wifi, HardDrive, MemoryStick } from "lucide-react";

interface NodeData {
  id: string;
  uuid: string;
  name: string;
  location: string;
  fqdn: string;
  status: string;
  daemonKey: string;
  nodeSecret: string;
  maxRam: number;
  maxDisk: number;
  maxServers: number;
  _count: { servers: number };
}

export default function AdminNodesPage() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFqdn, setNewFqdn] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newMaxRam, setNewMaxRam] = useState(32768);
  const [newMaxDisk, setNewMaxDisk] = useState(102400);
  const [newMaxServers, setNewMaxServers] = useState(10);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [panelOrigin, setPanelOrigin] = useState("https://YOUR_PANEL_DOMAIN");

  useEffect(() => {
    setPanelOrigin(window.location.origin);
  }, []);

  useEffect(() => { loadNodes(); }, []);

  async function loadNodes() {
    try {
      const res = await fetch("/api/nodes");
      const data = await res.json();
      setNodes(data.nodes || []);
    } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName || !newFqdn) return;
    setCreating(true);
    try {
      const res = await fetch("/api/nodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          fqdn: newFqdn,
          location: newLocation || "default",
          maxRam: newMaxRam,
          maxDisk: newMaxDisk,
          maxServers: newMaxServers,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewName("");
        setNewFqdn("");
        setNewLocation("");
        loadNodes();
      }
    } catch {}
    setCreating(false);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-48" />
      <div className="skeleton h-32" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-slate-800/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-ryzen-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-ryzen-600/20 border border-red-500/20">
              <Shield size={28} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin — Nodes</h1>
              <p className="text-sm text-slate-400 mt-1">Manage Wings daemon nodes</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary bg-red-600 hover:bg-red-500">
            <Plus size={16} /> Add Node
          </button>
        </div>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card border-red-500/20 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">New Node</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-400">Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="input-field mt-1" placeholder="Main Node" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">FQDN / Public IP</label>
              <input value={newFqdn} onChange={e => setNewFqdn(e.target.value)} className="input-field mt-1" placeholder="node.example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Location</label>
              <input value={newLocation} onChange={e => setNewLocation(e.target.value)} className="input-field mt-1" placeholder="New York, USA" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Max RAM (MB)</label>
              <input type="number" value={newMaxRam} onChange={e => setNewMaxRam(Number(e.target.value))} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Max Disk (MB)</label>
              <input type="number" value={newMaxDisk} onChange={e => setNewMaxDisk(Number(e.target.value))} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Max Servers</label>
              <input type="number" value={newMaxServers} onChange={e => setNewMaxServers(Number(e.target.value))} className="input-field mt-1" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate} disabled={creating} className="btn-primary bg-red-600 hover:bg-red-500">
              {creating ? "Creating..." : "Create & Generate Config"}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.div>
      )}

      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 card">
          <Globe size={48} className="text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-400">No nodes configured</p>
          <p className="text-sm text-slate-500 mt-1">Add your first Wings daemon node</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-6">
            <Plus size={16} /> Add Node
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {nodes.map((node, idx) => {
            const installCmd = `bash <(curl -s https://raw.githubusercontent.com/anomalyco/ryzenpanel/main/install.sh) --wings --panel-url="${panelOrigin}" --node-uuid="${node.uuid}" --node-secret="${node.nodeSecret}" --daemon-key="${node.daemonKey}" --fqdn="${node.fqdn}"`;
            return (
              <motion.div key={node.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card border-slate-800/50 overflow-hidden">
                <div className="flex items-start justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${node.status === "online" ? "bg-green-500/10" : "bg-slate-800"}`}>
                      <Globe size={24} className={node.status === "online" ? "text-green-400" : "text-slate-500"} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{node.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{node.fqdn} &middot; {node.location}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-slate-500"><Wifi size={12} className="inline mr-1" />{node._count.servers}/{node.maxServers} servers</span>
                        <span className="text-xs text-slate-500"><MemoryStick size={12} className="inline mr-1" />{node.maxRam >= 1024 ? `${(node.maxRam / 1024).toFixed(0)}G` : `${node.maxRam}M`}</span>
                        <span className="text-xs text-slate-500"><HardDrive size={12} className="inline mr-1" />{node.maxDisk >= 1024 ? `${(node.maxDisk / 1024).toFixed(0)}G` : `${node.maxDisk}M`}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`badge ${node.status === "online" ? "badge-green" : "badge-red"}`}>
                    {node.status}
                  </div>
                </div>

                <div className="border-t border-slate-800/50 p-5 space-y-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">One-Click Install Command</p>
                  <div className="relative">
                    <pre className="text-xs text-ryzen-300 bg-slate-950 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all select-all">{installCmd}</pre>
                    <button onClick={() => copyToClipboard(installCmd, `cmd-${node.id}`)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    >
                      {copiedId === `cmd-${node.id}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Node UUID:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-ryzen-300 bg-slate-950 px-2 py-1 rounded-lg truncate">{node.uuid}</code>
                        <button onClick={() => copyToClipboard(node.uuid, `uuid-${node.id}`)} className="shrink-0 p-1 rounded hover:bg-slate-800 text-slate-500">
                          {copiedId === `uuid-${node.id}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Daemon Key:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-ryzen-300 bg-slate-950 px-2 py-1 rounded-lg truncate">{node.daemonKey.substring(0, 16)}...</code>
                        <button onClick={() => copyToClipboard(node.daemonKey, `key-${node.id}`)} className="shrink-0 p-1 rounded hover:bg-slate-800 text-slate-500">
                          {copiedId === `key-${node.id}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Node Secret:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-ryzen-300 bg-slate-950 px-2 py-1 rounded-lg truncate">{node.nodeSecret.substring(0, 16)}...</code>
                        <button onClick={() => copyToClipboard(node.nodeSecret, `sec-${node.id}`)} className="shrink-0 p-1 rounded hover:bg-slate-800 text-slate-500">
                          {copiedId === `sec-${node.id}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
