"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, XCircle } from "lucide-react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`).then(r => r.ok ? r.json() : null).then(d => {
      if (!d) router.push("/tickets");
      else setTicket(d);
    });
  }, [params.id, router]);

  async function handleSend() {
    if (!message.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/tickets/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("");
      fetch(`/api/tickets/${params.id}`).then(r => r.json()).then(setTicket);
    }
  }

  async function handleClose() {
    await fetch(`/api/tickets/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close" }),
    });
    router.push("/tickets");
  }

  if (!ticket) return <div className="p-6"><div className="skeleton h-96" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/tickets" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
        <ChevronLeft size={14} /> Back to Tickets
      </Link>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{ticket.subject}</h2>
              <span className={`badge text-xs ${ticket.status === "OPEN" ? "badge-green" : ticket.status === "REPLIED" ? "badge-yellow" : "badge-slate"}`}>{ticket.status}</span>
              <span className={`badge text-xs ${ticket.priority === "HIGH" || ticket.priority === "CRITICAL" ? "badge-red" : "badge-slate"}`}>{ticket.priority}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{ticket.category} • Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
          {ticket.status !== "CLOSED" && (
            <button onClick={handleClose} className="btn-ghost text-xs text-red-400">
              <XCircle size={14} /> Close
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {ticket.messages?.map((msg: any) => (
          <div key={msg.id} className={`card ${msg.isAdmin ? "border-ryzen-500/20 bg-ryzen-500/5" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">
                  {msg.user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs font-medium text-slate-300">{msg.user?.username}</span>
                {msg.isAdmin && <span className="badge-green text-[10px]">Staff</span>}
              </div>
              <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{msg.message}</p>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <div className="flex gap-2">
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            className="input-field flex-1 h-20 resize-none" placeholder="Type your reply..." />
          <button onClick={handleSend} disabled={loading || !message.trim()} className="btn-primary self-end">
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
