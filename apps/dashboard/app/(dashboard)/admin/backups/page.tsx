"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/backups").then(r => r.json()).then(d => setBackups(d.backups || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Backups</h2>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_100px_100px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Name</span><span>Server</span><span>Size</span><span>Status</span>
        </div>
        {backups.map((b: any) => (
          <div key={b.id} className="grid grid-cols-[1fr_120px_100px_100px] gap-4 px-4 py-3 text-sm hover:bg-slate-800/20">
            <span className="text-slate-300">{b.name}</span>
            <span className="text-slate-500">{b.server?.name}</span>
            <span className="text-slate-400">{b.bytes ? `${(b.bytes / 1024 / 1024).toFixed(1)} MB` : "—"}</span>
            <span className={`badge text-xs w-fit ${b.isSuccessful ? "badge-green" : "badge-yellow"}`}>{b.isSuccessful ? "Success" : "Pending"}</span>
          </div>
        ))}
        {backups.length === 0 && <p className="text-sm text-slate-500 p-8 text-center"><HardDrive size={32} className="mx-auto mb-2 text-slate-700" />No backups</p>}
      </div>
    </div>
  );
}
