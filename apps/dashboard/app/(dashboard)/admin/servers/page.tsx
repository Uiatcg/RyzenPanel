"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function AdminServersPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/servers").then(r => r.json()).then(d => setServers(d.servers || [])).catch(() => {});
  }, []);

  const filtered = servers.filter((s: any) => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Servers</h2>
        <span className="text-xs text-slate-500">{servers.length} total</span>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" placeholder="Search servers..." />
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_80px_100px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Name</span><span>Owner</span><span>Status</span><span>Node</span>
        </div>
        {filtered.map((s: any) => (
          <div key={s.id} className="grid grid-cols-[1fr_100px_80px_100px] gap-4 px-4 py-3 text-sm hover:bg-slate-800/20">
            <span className="text-white font-medium">{s.name}</span>
            <span className="text-slate-400 text-xs">{s.owner?.username || "—"}</span>
            <span className={`badge text-xs w-fit ${
              s.status === "ONLINE" ? "badge-green" : s.status === "OFFLINE" ? "badge-red" : "badge-yellow"
            }`}>{s.status}</span>
            <span className="text-slate-500 text-xs">{s.node?.name || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
