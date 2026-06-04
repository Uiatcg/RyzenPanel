"use client";

import { useEffect, useState } from "react";
import { Plus, Percent } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/coupons").then(r => r.json()).then(d => setCoupons(d.coupons || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Coupons</h2>
        <button className="btn-primary text-xs px-3 py-2"><Plus size={14} /> Create Coupon</button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_100px_120px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Code</span><span>Discount</span><span>Uses</span><span>Status</span>
        </div>
        {coupons.map((c: any) => (
          <div key={c.id} className="grid grid-cols-[1fr_80px_100px_120px] gap-4 px-4 py-3 text-sm hover:bg-slate-800/20">
            <span className="font-mono text-sm font-bold text-ryzen-400">{c.code}</span>
            <span className="text-white">{c.discount}%</span>
            <span className="text-slate-400">{c.usedCount}/{c.maxUses || "∞"}</span>
            <span className={`badge text-xs w-fit ${c.isActive ? "badge-green" : "badge-red"}`}>{c.isActive ? "Active" : "Inactive"}</span>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-slate-500 p-8 text-center"><Percent size={32} className="mx-auto mb-2 text-slate-700" />No coupons</p>}
      </div>
    </div>
  );
}
