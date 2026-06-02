"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Plus, Play, Pause, Trash2 } from "lucide-react";

export default function SchedulesPage() {
  const params = useParams();
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/servers/${params.id}/schedules`).then(r => r.json()).then(d => setSchedules(d.schedules || []));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Schedules</h3>
          <p className="text-xs text-slate-500">Automate server tasks</p>
        </div>
        <button className="btn-primary text-xs px-3 py-2"><Plus size={14} /> New Schedule</button>
      </div>

      {schedules.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Clock size={40} className="text-slate-700 mb-4" />
          <p className="text-sm font-medium text-slate-400">No schedules</p>
          <p className="text-xs text-slate-500 mt-1">Create automated tasks for your server</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-ryzen-400" />
                <div>
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{s.cronMinute} {s.cronHour} {s.cronDayOfMonth} {s.cronMonth} {s.cronDayOfWeek}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn-ghost text-xs"><Pause size={14} /></button>
                <button className="btn-ghost text-xs text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
