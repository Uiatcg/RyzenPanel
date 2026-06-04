"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Globe, Plus, Trash2 } from "lucide-react";

export default function NetworkPage() {
  const params = useParams();
  const [allocations, setAllocations] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/servers/${params.id}/allocations`).then(r => r.json()).then(d => setAllocations(d.allocations || []));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Network</h3>
          <p className="text-xs text-slate-500">Manage IP addresses and ports</p>
        </div>
        <button className="btn-primary text-xs px-3 py-2"><Plus size={14} /> Add Allocation</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-[1fr_100px_100px] gap-4 border-b border-slate-800/50 pb-3 mb-3 text-xs font-medium text-slate-500">
          <span>IP Address</span>
          <span>Port</span>
          <span>Actions</span>
        </div>
        {allocations.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No allocations assigned</p>
        ) : (
          <div className="space-y-2">
            {allocations.map((a: any) => (
              <div key={a.id} className="grid grid-cols-[1fr_100px_100px] gap-4 items-center py-2">
                <span className="text-sm text-slate-300 font-mono">{a.ip}</span>
                <span className="text-sm text-slate-300 font-mono">{a.port}</span>
                <button className="btn-ghost text-xs text-red-400 w-fit"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
