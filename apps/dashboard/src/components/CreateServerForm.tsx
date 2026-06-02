"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NodeItem {
  id: string;
  name: string;
}

export default function CreateServerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ram, setRam] = useState(2048);
  const [cpu, setCpu] = useState(1);
  const [storage, setStorage] = useState(20480);
  const [javaVersion, setJavaVersion] = useState("17");
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch nodes for selection
    fetch("/api/nodes")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.nodes) setNodes(data.nodes.map((n: any) => ({ id: n.id, name: n.name })));
      })
      .catch(() => {
        setNodes([]);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, ram, cpu, storage, javaVersion, nodeId }),
      });
      setLoading(false);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Failed to create server");
        return;
      }
      router.push("/my-servers");
    } catch (err) {
      setLoading(false);
      setError("Network error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold">Create Server</h2>
      {error ? <div className="rounded p-3 bg-rose-600/20 text-rose-300">{error}</div> : null}
      <label className="block">
        <span className="text-sm text-slate-300">Server Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80" />
      </label>

      <label className="block">
        <span className="text-sm text-slate-300">Description</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80" />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-sm text-slate-300">RAM (MB)</span>
          <input type="number" value={ram} onChange={(e) => setRam(Number(e.target.value))} className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">CPU (vCPU)</span>
          <input type="number" value={cpu} onChange={(e) => setCpu(Number(e.target.value))} className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Storage (MB)</span>
          <input type="number" value={storage} onChange={(e) => setStorage(Number(e.target.value))} className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-slate-300">Java Version</span>
          <select value={javaVersion} onChange={(e) => setJavaVersion(e.target.value)} className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80">
            <option value="8">8</option>
            <option value="11">11</option>
            <option value="17">17</option>
            <option value="19">19</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Node</span>
          <select value={nodeId ?? ""} onChange={(e) => setNodeId(e.target.value || null)} className="mt-2 w-full rounded px-4 py-3 bg-slate-950/80">
            <option value="">Auto</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" className="rounded bg-cyan-600 px-4 py-2 font-semibold" disabled={loading}>{loading ? "Creating…" : "Create Server"}</button>
      </div>
    </form>
  );
}
