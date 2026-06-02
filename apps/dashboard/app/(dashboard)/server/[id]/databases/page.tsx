"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Database, Plus, Trash2, Key, Globe } from "lucide-react";

export default function DatabasesPage() {
  const params = useParams();
  const [databases, setDatabases] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/servers/${params.id}/databases`).then(r => r.json()).then(d => setDatabases(d.databases || []));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Databases</h3>
          <p className="text-xs text-slate-500">Manage databases for this server</p>
        </div>
        <button className="btn-primary text-xs px-3 py-2"><Plus size={14} /> Create Database</button>
      </div>

      {databases.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Database size={40} className="text-slate-700 mb-4" />
          <p className="text-sm font-medium text-slate-400">No databases</p>
          <p className="text-xs text-slate-500 mt-1">Create a database to store your server data</p>
        </div>
      ) : (
        <div className="space-y-2">
          {databases.map((db: any) => (
            <div key={db.id} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">{db.database}</p>
                  <p className="text-xs text-slate-500">{db.username}@{db.host}:{db.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs"><Key size={14} /></button>
                <button className="btn-ghost text-xs text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
