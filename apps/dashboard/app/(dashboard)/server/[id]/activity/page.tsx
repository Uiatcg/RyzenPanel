"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { List, Filter } from "lucide-react";

export default function ActivityPage() {
  const params = useParams();
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/servers/${params.id}/activity`).then(r => r.json()).then(d => setActivity(d.activity || []));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Activity Log</h3>
          <p className="text-xs text-slate-500">Server event history</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select className="text-xs bg-transparent text-slate-400 border border-slate-700 rounded-lg px-2 py-1">
            <option>All</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Error</option>
          </select>
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <List size={40} className="text-slate-700 mb-4" />
          <p className="text-sm font-medium text-slate-400">No activity recorded</p>
          <p className="text-xs text-slate-500 mt-1">Server events will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activity.map((a: any) => (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between rounded-xl bg-slate-800/20 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${
                  a.status === "SUCCESS" ? "bg-ryzen-400" : a.status === "WARNING" ? "bg-yellow-400" : "bg-red-400"
                }`} />
                <div>
                  <p className="text-sm text-slate-300">{a.title}</p>
                  {a.detail && <p className="text-xs text-slate-500">{a.detail}</p>}
                </div>
              </div>
              <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
