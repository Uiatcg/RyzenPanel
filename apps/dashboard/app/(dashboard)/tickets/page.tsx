"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, Plus, MessageCircle } from "lucide-react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tickets").then(r => r.json()).then(d => setTickets(d.tickets || [])).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm text-slate-400 mt-1">Get help from our support team</p>
        </div>
        <Link href="/tickets/new" className="btn-primary">
          <Plus size={16} /> New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col items-center justify-center py-16 text-center">
          <Ticket size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-medium text-slate-400">No support tickets</p>
          <p className="text-sm text-slate-500 mt-1">Open a ticket if you need help with anything</p>
          <Link href="/tickets/new" className="btn-primary mt-6">
            <Plus size={16} /> Open a Ticket
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t: any) => (
            <Link key={t.id} href={`/tickets/${t.id}`}
              className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3 hover:bg-slate-700/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={16} className="text-ryzen-400" />
                <div>
                  <p className="text-sm font-medium text-white">{t.subject}</p>
                  <p className="text-xs text-slate-500">{t.category} • {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${
                  t.status === "OPEN" ? "badge-green" : t.status === "REPLIED" ? "badge-yellow" : "badge-slate"
                }`}>{t.status}</span>
                <span className={`badge text-xs ${
                  t.priority === "HIGH" || t.priority === "CRITICAL" ? "badge-red" : "badge-slate"
                }`}>{t.priority}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
