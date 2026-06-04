"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Check, Zap, Star, Crown, Diamond } from "lucide-react";

const plans = [
  { name: "Free", price: 0, ram: 1024, cpu: 100, disk: 5120, backups: 1, databases: 1, servers: 1, icon: Zap, popular: false, emoji: "⛏️" },
  { name: "Starter", price: 4.99, ram: 4096, cpu: 200, disk: 20480, backups: 3, databases: 2, servers: 3, icon: Star, popular: true, emoji: "🌟" },
  { name: "Pro", price: 14.99, ram: 16384, cpu: 400, disk: 51200, backups: 10, databases: 5, servers: 10, icon: Crown, popular: false, emoji: "👑" },
  { name: "Enterprise", price: 49.99, ram: 65536, cpu: 800, disk: 204800, backups: 50, databases: 20, servers: 50, icon: Crown, popular: false, emoji: "💎" },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/billing/invoices").then(r => r.json()).then(d => setInvoices(d.invoices || [])).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">💳 Billing</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your subscription and billing</p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const popular = plan.popular;
          return (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                popular
                  ? "border-ryzen-500/30 bg-gradient-to-b from-ryzen-500/10 to-slate-900/50 ryzen-glow-sm"
                  : "border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40"
              }`}
            >
              {popular && (
                <div className="absolute -top-8 -right-8 w-24 h-24 opacity-[0.06]">
                  <Diamond size={80} className="text-ryzen-500" />
                </div>
              )}
              {popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-ryzen-500 to-red-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                  ⭐ Popular
                </span>
              )}
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/30">
                  <Icon size={22} className={popular ? "text-ryzen-400" : "text-slate-400"} />
                </div>
                <h3 className="text-lg font-bold text-white">{plan.emoji} {plan.name}</h3>
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
                  `${plan.backups} Backup${plan.backups > 1 ? "s" : ""}`,
                  `${plan.databases} Database${plan.databases > 1 ? "s" : ""}`,
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs">
                    <Check size={12} className="text-ryzen-400 flex-shrink-0" />
                    <span className="text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                popular
                  ? "bg-gradient-to-r from-ryzen-600 to-ryzen-500 text-white hover:shadow-lg hover:shadow-ryzen-500/25"
                  : "border border-slate-700/30 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}>
                {plan.price === 0 ? "🚀 Get Started" : "💳 Subscribe"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">📄 Invoices</h2>
          <div className="space-y-1">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3">
                <div>
                  <p className="text-sm text-white">{inv.description}</p>
                  <p className="text-[10px] text-slate-500">{new Date(inv.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">${inv.amount.toFixed(2)}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    inv.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
