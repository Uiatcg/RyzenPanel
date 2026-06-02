"use client";

import { useEffect, useState } from "react";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/invoices").then(r => r.json()).then(d => setInvoices(d.invoices || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Invoices</h2>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_120px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Description</span><span>User</span><span>Amount</span><span>Status</span>
        </div>
        {invoices.map((inv: any) => (
          <div key={inv.id} className="grid grid-cols-[2fr_1fr_100px_120px] gap-4 px-4 py-3 text-sm hover:bg-slate-800/20">
            <span className="text-slate-300">{inv.description}</span>
            <span className="text-slate-400">{inv.user?.username}</span>
            <span className="text-white font-medium">${inv.amount.toFixed(2)}</span>
            <span className={`badge text-xs w-fit ${inv.status === "PAID" ? "badge-green" : inv.status === "PENDING" ? "badge-yellow" : "badge-red"}`}>{inv.status}</span>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-sm text-slate-500 p-8 text-center">No invoices</p>}
      </div>
    </div>
  );
}
