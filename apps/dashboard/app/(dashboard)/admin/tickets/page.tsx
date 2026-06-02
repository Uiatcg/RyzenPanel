"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/tickets").then(r => r.json()).then(d => setTickets(d.tickets || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Support Tickets</h2>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_120px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Subject</span><span>User</span><span>Status</span><span>Created</span>
        </div>
        {tickets.map((t: any) => (
          <div key={t.id} className="grid grid-cols-[2fr_1fr_100px_120px] gap-4 px-4 py-3 text-sm hover:bg-slate-800/20">
            <span className="text-white font-medium">{t.subject}</span>
            <span className="text-slate-400">{t.user?.username}</span>
            <span className={`badge text-xs w-fit ${t.status === "OPEN" ? "badge-green" : t.status === "REPLIED" ? "badge-yellow" : "badge-slate"}`}>{t.status}</span>
            <span className="text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-sm text-slate-500 p-8 text-center">No tickets</p>}
      </div>
    </div>
  );
}
