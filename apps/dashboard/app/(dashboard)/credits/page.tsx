"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coins, Gift, History, ShoppingBag, Sparkles,
  ArrowRight, Clock, TrendingUp, TrendingDown,
  Plus, Minus, CheckCircle, AlertCircle, Star, Zap,
} from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "history" | "shop" | "earn";

interface CreditData {
  credits: number;
  recentTransactions?: any[];
  totalEarned?: number;
  totalSpent?: number;
  canClaimDaily?: boolean;
  transactions?: any[];
  items?: any[];
}

export default function CreditsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/credits?tab=${tab}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  async function handleEarn(method: string) {
    setClaiming(true);
    setMessage(null);
    try {
      const res = await fetch("/api/credits/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `+${result.earned} credits earned!` });
        setData(prev => prev ? { ...prev, credits: result.credits } : prev);
        if (tab === "overview") {
          fetch("/api/credits?tab=overview").then(r => r.json()).then(d => setData(d));
        }
      } else {
        setMessage({ type: "error", text: result.error || "Failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setClaiming(false);
  }

  async function handleSpend(itemId: string) {
    setClaiming(true);
    setMessage(null);
    try {
      const res = await fetch("/api/credits/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Purchased! ${result.spent} credits spent.` });
        setData(prev => prev ? { ...prev, credits: result.credits } : prev);
      } else {
        setMessage({ type: "error", text: result.error || "Failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setClaiming(false);
  }

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: Coins },
    { id: "earn" as Tab, label: "Earn", icon: Gift },
    { id: "shop" as Tab, label: "Shop", icon: ShoppingBag },
    { id: "history" as Tab, label: "History", icon: History },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-2 border-amber-500/30 gold-glow-sm animate-float">
              <Coins size={30} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Credits</h1>
              <p className="text-sm text-slate-400 mt-1">Earn and spend credits for resources</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Balance</p>
            <p className="text-3xl font-bold text-amber-400 font-mono">{data?.credits?.toLocaleString() || "0"}</p>
          </div>
        </div>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:bg-slate-800/30 border border-transparent"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {tab === "overview" && data && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span className="text-xs text-slate-400">Total Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">+{data.totalEarned?.toLocaleString() || "0"}</p>
                </div>
                <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={16} className="text-red-400" />
                    <span className="text-xs text-slate-400">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400 font-mono">-{data.totalSpent?.toLocaleString() || "0"}</p>
                </div>
                <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins size={16} className="text-amber-400" />
                    <span className="text-xs text-slate-400">Current Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-400 font-mono">{data.credits?.toLocaleString() || "0"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <button onClick={() => handleEarn("daily")} disabled={claiming || !data.canClaimDaily}
                    className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 p-4 text-left hover:from-amber-500/20 hover:to-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Gift size={24} className="text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Daily Reward</p>
                      <p className="text-xs text-slate-400">{data.canClaimDaily ? "Claim your daily credits" : "Already claimed today"}</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600" />
                  </button>
                  <button onClick={() => handleEarn("ad")} disabled={claiming}
                    className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 p-4 text-left hover:from-violet-500/20 hover:to-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={24} className="text-violet-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Watch Ad</p>
                      <p className="text-xs text-slate-400">Earn credits from ads</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600" />
                  </button>
                </div>
              </div>

              {data.recentTransactions && data.recentTransactions.length > 0 && (
                <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                    <button onClick={() => setTab("history")} className="text-xs text-amber-400 hover:text-amber-300">View all</button>
                  </div>
                  <div className="space-y-2">
                    {data.recentTransactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-800/20 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                            {t.amount > 0 ? <Plus size={14} className="text-emerald-400" /> : <Minus size={14} className="text-red-400" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-300">{t.type.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-slate-600">{new Date(t.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-mono font-bold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {t.amount > 0 ? "+" : ""}{t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "earn" && (
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Star size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Daily Login</h3>
                    <p className="text-xs text-slate-400">Come back every day for free credits</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-amber-400 font-mono mb-4">+5 credits</p>
                <button onClick={() => handleEarn("daily")} disabled={claiming || !data?.canClaimDaily}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {data?.canClaimDaily ? "Claim Daily Reward" : "Already Claimed"}
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Zap size={24} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Watch Ad</h3>
                    <p className="text-xs text-slate-400">Watch a short ad for credits</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-violet-400 font-mono mb-4">+10 credits</p>
                <button onClick={() => handleEarn("ad")} disabled={claiming}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claiming ? "Loading..." : "Watch Ad"}
                </button>
              </motion.div>
            </div>
          )}

          {tab === "shop" && (
            <div className="space-y-6">
              {["RAM", "CPU", "Disk", "Extras"].map(category => {
                const items = (data?.items || []).filter((i: any) => i.category === category);
                if (items.length === 0) return null;
                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-white mb-3">{category}</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((item: any) => (
                        <div key={item.id} className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 feature-card">
                          <h4 className="text-sm font-semibold text-white mb-1">{item.name}</h4>
                          <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4">
                            {item.ram ? <span className="bg-slate-800/50 px-2 py-0.5 rounded">+{item.ram}MB RAM</span> : null}
                            {item.cpu ? <span className="bg-slate-800/50 px-2 py-0.5 rounded">+{item.cpu}% CPU</span> : null}
                            {item.disk ? <span className="bg-slate-800/50 px-2 py-0.5 rounded">+{item.disk}MB Disk</span> : null}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-amber-400 font-mono">{item.cost}</span>
                            <button onClick={() => handleSpend(item.id)} disabled={claiming || (data?.credits || 0) < item.cost}
                              className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                            >
                              Buy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(!data?.items || data.items.length === 0) && (
                <div className="text-center py-12">
                  <ShoppingBag size={40} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No items available yet</p>
                  <p className="text-xs text-slate-600 mt-1">Admin can add items in the credit shop settings</p>
                </div>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6">
              {data?.transactions && data.transactions.length > 0 ? (
                <div className="space-y-2">
                  {data.transactions.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-800/20 px-4 py-3 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                          {t.amount > 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-300">{t.type.replace(/_/g, " ")}</p>
                          <p className="text-[10px] text-slate-600">{new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-mono font-bold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {t.amount > 0 ? "+" : ""}{t.amount}
                        </span>
                        <p className="text-[10px] text-slate-600">bal: {t.balance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History size={40} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No transactions yet</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
