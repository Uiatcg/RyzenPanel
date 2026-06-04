"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = ["general", "billing", "technical", "server-issue", "abuse", "other"];

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, category, priority, message }),
    });
    setLoading(false);
    if (res.ok) router.push("/tickets");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/tickets" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-6">
        <ChevronLeft size={14} /> Back to Tickets
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">New Support Ticket</h1>
        <p className="text-sm text-slate-400 mb-8">Describe your issue and we&apos;ll get back to you</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-400">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} required className="input-field mt-1.5" placeholder="Brief description of the issue" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field mt-1.5">
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field mt-1.5">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required
              className="input-field mt-1.5 h-40 resize-none" placeholder="Describe your issue in detail..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            <Send size={16} /> {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
