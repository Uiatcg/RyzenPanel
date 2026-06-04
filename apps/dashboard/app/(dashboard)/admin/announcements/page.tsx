"use client";

import { useEffect, useState } from "react";
import { Plus, Megaphone } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/announcements").then(r => r.json()).then(d => setAnnouncements(d.announcements || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Announcements</h2>
        <button className="btn-primary text-xs px-3 py-2"><Plus size={14} /> New Announcement</button>
      </div>
      <div className="space-y-2">
        {announcements.map((a: any) => (
          <div key={a.id} className="card flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-ryzen-400" />
                <p className="text-sm font-semibold text-white">{a.title}</p>
              </div>
              <p className="text-xs text-slate-400 mt-2">{a.content}</p>
              <p className="text-[10px] text-slate-500 mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`badge text-xs ${a.isActive ? "badge-green" : "badge-slate"}`}>{a.isActive ? "Active" : "Draft"}</span>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone size={40} className="text-slate-700 mb-4" />
            <p className="text-sm text-slate-400">No announcements</p>
          </div>
        )}
      </div>
    </div>
  );
}
