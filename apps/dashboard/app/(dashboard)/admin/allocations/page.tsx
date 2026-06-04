"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Plus, X, Trash2, Network,
} from "lucide-react";

export default function AdminAllocationsPage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nodeId: "", ip: "", startPort: 25565, endPort: 25575, notes: "" });
  const [deleting, setDeleting] = useState<string[]>([]);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/allocations").then(r => r.json()),
      fetch("/api/admin/nodes").then(r => r.json()),
    ]).then(([a, n]) => {
      setAllocations(a.allocations || []);
      setNodes(n.nodes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nodeId || !form.ip || !form.startPort) return;

    const ports = form.endPort && form.endPort > form.startPort
      ? [{ start: form.startPort, end: form.endPort }]
      : [form.startPort];

    const res = await fetch("/api/admin/allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodeId: form.nodeId,
        ip: form.ip,
        ports,
        notes: form.notes,
      }),
    });

    if (res.ok) {
      setShowCreate(false);
      setForm({ nodeId: "", ip: "", startPort: 25565, endPort: 25575, notes: "" });
      fetchData();
    }
  }

  async function handleDelete(id: string) {
    setDeleting(prev => [...prev, id]);
    await fetch(`/api/admin/allocations?id=${id}`, { method: "DELETE" });
    setDeleting(prev => prev.filter(d => d !== id));
    fetchData();
  }

  const groupedByNode: Record<string, { node: any; allocations: any[] }> = {};
  allocations.forEach((a: any) => {
    const key = a.node?.name || "Unknown";
    if (!groupedByNode[key]) groupedByNode[key] = { node: a.node, allocations: [] };
    groupedByNode[key].allocations.push(a);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Allocations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage IP and port allocations per node</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-xs px-3 py-2">
          <Plus size={14} /> Create Allocations
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : Object.keys(groupedByNode).length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Globe size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-medium text-slate-400">No allocations</p>
          <p className="text-sm text-slate-500 mt-1">Create allocations for your nodes to assign to servers</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-6">
            <Plus size={16} /> Create Allocations
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByNode).map(([nodeName, group]) => (
            <div key={nodeName} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Network size={16} className="text-ryzen-400" />
                  <h3 className="text-sm font-semibold text-white">{nodeName}</h3>
                  <span className="badge-slate text-[10px]">{group.allocations.length} allocations</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-[1fr_80px_120px_100px_60px] gap-4 border-b border-slate-800/50 px-2 py-2 text-xs font-medium text-slate-500">
                    <span>IP</span><span>Port</span><span>Assigned To</span><span>Notes</span><span />
                  </div>
                  <div className="divide-y divide-slate-800/30">
                    {group.allocations.map((a: any) => (
                      <div key={a.id} className="grid grid-cols-[1fr_80px_120px_100px_60px] gap-4 px-2 py-2.5 text-sm hover:bg-slate-800/20 transition-colors">
                        <span className="font-mono text-slate-300 text-xs">{a.ip}</span>
                        <span className="font-mono text-slate-300 text-xs">{a.port}</span>
                        <span className={`text-xs ${a.server ? "text-ryzen-400" : "text-slate-600"}`}>
                          {a.server?.name || "Free"}
                        </span>
                        <span className="text-xs text-slate-500 truncate">{a.notes || "—"}</span>
                        <button onClick={() => handleDelete(a.id)} disabled={deleting.includes(a.id)}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Create Allocations</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Add IP and port range to a node</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="btn-ghost p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400">Node</label>
                  <select value={form.nodeId} onChange={e => setForm({...form, nodeId: e.target.value})}
                    className="input-field mt-1" required>
                    <option value="">Select a node...</option>
                    {nodes.map((n: any) => (
                      <option key={n.id} value={n.id}>{n.name} ({n.fqdn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400">IP Address</label>
                  <input value={form.ip} onChange={e => setForm({...form, ip: e.target.value})}
                    className="input-field mt-1" placeholder="192.168.1.5" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400">Start Port</label>
                    <input type="number" value={form.startPort} onChange={e => setForm({...form, startPort: Number(e.target.value)})}
                      className="input-field mt-1" min={1} max={65535} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">End Port (optional)</label>
                    <input type="number" value={form.endPort} onChange={e => setForm({...form, endPort: Number(e.target.value)})}
                      className="input-field mt-1" min={1} max={65535} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400">Notes (optional)</label>
                  <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className="input-field mt-1" placeholder="e.g., Minecraft servers" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    <Globe size={14} /> Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}