"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Check, Zap, Star, Crown } from "lucide-react";

const plans = [
  { name: "Free", price: 0, ram: 1024, cpu: 100, disk: 5120, backups: 1, databases: 1, servers: 1, icon: Zap, popular: false },
  { name: "Starter", price: 4.99, ram: 4096, cpu: 200, disk: 20480, backups: 3, databases: 2, servers: 3, icon: Star, popular: true },
  { name: "Pro", price: 14.99, ram: 16384, cpu: 400, disk: 51200, backups: 10, databases: 5, servers: 10, icon: Crown, popular: false },
  { name: "Enterprise", price: 49.99, ram: 65536, cpu: 800, disk: 204800, backups: 50, databases: 20, servers: 50, icon: Crown, popular: false },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/billing/invoices").then(r => r.json()).then(d => setInvoices(d.invoices || [])).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your subscription and billing</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => (
          <motion.div key={plan.name} whileHover={{ y: -4 }} className={`card relative ${plan.popular ? "border-ryzen-500/30 ring-1 ring-ryzen-500/20" : ""}`}>
            {plan.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-ryzen-500 to-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Popular
              </span>
            )}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                <plan.icon size={20} className={plan.popular ? "text-ryzen-400" : "text-slate-400"} />
              </div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-sm text-slate-500">/mo</span>
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {[
                `${plan.servers} Server${plan.servers > 1 ? "s" : ""}`,
                `${plan.ram >= 1024 ? `${plan.ram / 1024} GB` : `${plan.ram} MB`} RAM`,
                `${plan.cpu}% CPU`,
                `${plan.disk >= 1024 ? `${plan.disk / 1024} GB` : `${plan.disk} MB`} Disk`,
                `${plan.backups} Backups`,
                `${plan.databases} Databases`,
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <Check size={12} className="text-ryzen-400" />
                  {f}
                </div>
              ))}
            </div>

            <button className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
              plan.price === 0
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-gradient-to-r from-ryzen-600 to-ryzen-500 text-white hover:from-ryzen-500 hover:to-ryzen-400"
            }`}>
              {plan.price === 0 ? "Current Plan" : "Upgrade"}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Invoice History</h3>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard size={32} className="text-slate-700 mb-3" />
            <p className="text-sm text-slate-400">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between rounded-xl bg-slate-800/20 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-300">{inv.description}</p>
                  <p className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">${inv.amount.toFixed(2)}</span>
                  <span className={`badge text-xs ${
                    inv.status === "PAID" ? "badge-green" : inv.status === "PENDING" ? "badge-yellow" : "badge-red"
                  }`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
