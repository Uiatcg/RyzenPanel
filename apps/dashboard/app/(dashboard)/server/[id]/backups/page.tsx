"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { HardDrive, Download, Trash2, Lock, Play, Plus } from "lucide-react";

export default function BackupsPage() {
  const params = useParams();
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/servers/${params.id}/backups`).then(r => r.json()).then(d => setBackups(d.backups || []));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Backups</h3>
          <p className="text-xs text-slate-500">Manage server backups</p>
        </div>
        <button className="btn-primary text-xs px-3 py-2"><Plus size={14} /> Create Backup</button>
      </div>

      {backups.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <HardDrive size={40} className="text-slate-700 mb-4" />
          <p className="text-sm font-medium text-slate-400">No backups yet</p>
          <p className="text-xs text-slate-500 mt-1">Create your first backup to secure your server data</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((b: any) => (
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {b.isLocked ? <Lock size={16} className="text-yellow-400" /> : <HardDrive size={16} className="text-ryzen-400" />}
                <div>
                  <p className="text-sm font-medium text-white">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.bytes ? `${(b.bytes / 1024 / 1024).toFixed(1)} MB` : "—"} • {new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn-ghost text-xs"><Download size={14} /></button>
                <button className="btn-ghost text-xs"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
