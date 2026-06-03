"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity, Cpu, MemoryStick, HardDrive, Wifi, Server, Zap,
} from "lucide-react";

interface MetricPoint { label: string; value: number; }

function MiniSparkline({ data, color }: { data: MetricPoint[]; color: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 120; const h = 40;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.value / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServerOverviewPage() {
  const params = useParams();
  const [server, setServer] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    cpu: [] as MetricPoint[], ram: [] as MetricPoint[],
    disk: [] as MetricPoint[], network: [] as MetricPoint[],
  });

  useEffect(() => {
    fetch(`/api/servers/${params.id}`).then(r => r.json()).then(setServer);
    fetch(`/api/servers/${params.id}/activity`).then(r => r.json()).then(d => setActivity(d.activity || []));
  }, [params.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const label = now.toLocaleTimeString();
      setMetrics(prev => {
        const cpu = Math.round(Math.random() * 100);
        const ram = Math.round(Math.random() * server?.ram || 2048);
        const disk = Math.round(Math.random() * server?.disk || 10240);
        const network = Math.round(Math.random() * 100);
        return {
          cpu: [...prev.cpu.slice(-19), { label, value: cpu }],
          ram: [...prev.ram.slice(-19), { label, value: ram }],
          disk: [...prev.disk.slice(-19), { label, value: disk }],
          network: [...prev.network.slice(-19), { label, value: network }],
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [server?.ram, server?.disk]);

  if (!server) return (
    <div className="p-6 space-y-4">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );

  const stats = [
    { label: "CPU", value: `${metrics.cpu[metrics.cpu.length - 1]?.value || server.cpu}%`, icon: Cpu, color: "from-ryzen-500 to-red-600", data: metrics.cpu },
    { label: "RAM", value: `${metrics.ram[metrics.ram.length - 1]?.value || server.ram} MB`, icon: MemoryStick, color: "from-blue-500 to-cyan-500", data: metrics.ram },
    { label: "Disk", value: `${server.disk >= 1024 ? `${(server.disk / 1024).toFixed(1)} GB` : `${server.disk} MB`}`, icon: HardDrive, color: "from-violet-500 to-purple-500", data: metrics.disk },
    { label: "Network", value: `${metrics.network[metrics.network.length - 1]?.value || 0} Mbps`, icon: Wifi, color: "from-amber-500 to-orange-500", data: metrics.network },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 hover:border-slate-600/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`rounded-lg p-2 bg-gradient-to-r ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-500">{s.label}</span>
                  {s.data.length > 1 && (
                    <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity">
                      <MiniSparkline data={s.data} color={s.color.includes("ryzen") ? "#ef4444" : s.color.includes("blue") ? "#3b82f6" : s.color.includes("violet") ? "#8b5cf6" : "#f59e0b"} />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{s.value}</p>
              {s.data.length > 1 && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{
                    background: `linear-gradient(90deg, ${s.color.includes("ryzen") ? "#ef4444" : s.color.includes("blue") ? "#3b82f6" : s.color.includes("violet") ? "#8b5cf6" : "#f59e0b"}, ${s.color.includes("ryzen") ? "#f87171" : s.color.includes("blue") ? "#06b6d4" : s.color.includes("violet") ? "#a855f7" : "#f97316"})`,
                    width: `${Math.min(100, (s.data[s.data.length - 1]?.value || 0) / (s.label === "RAM" ? (server.ram || 1) : s.label === "Disk" ? (server.disk || 1) : 100) * 100)}%`,
                  }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[metrics.cpu, metrics.ram, metrics.disk, metrics.network].map((data, i) => {
          if (data.length < 2) return null;
          const labels = ["CPU", "RAM", "Disk", "Network"];
          const colors = ["#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b"];
          const max = Math.max(...data.map(d => d.value), 1);
          return (
            <div key={labels[i]}
              className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{labels[i]} Usage</span>
                <span className="text-[10px] text-slate-600">60s</span>
              </div>
              <div className="flex items-end gap-[2px] h-24">
                {data.map((d, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / max) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="rounded-sm"
                      style={{ backgroundColor: colors[i], opacity: 0.2 + (idx / data.length) * 0.5 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={14} className="text-ryzen-400" /> Server Information
          </h3>
          <div className="space-y-3">
            {[
              ["Server Name", server.name],
              ["UUID", server.uuid],
              ["Status", server.status],
              ["Docker Image", server.dockerImage],
              ["Node", server.node?.name || "—"],
              ["Egg", server.egg?.name || "—"],
              ["Created", new Date(server.createdAt).toLocaleDateString()],
              ["Owner", server.owner?.username || "—"],
            ].map(([l, v]) => (
              <div key={l as string} className="flex items-center justify-between py-1.5 border-b border-slate-800/30 last:border-0">
                <span className="text-xs text-slate-500">{l as string}</span>
                <span className="text-xs font-medium text-slate-300 truncate max-w-[200px]">{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={14} className="text-ryzen-400" /> Recent Activity
          </h3>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activity.slice(0, 15).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      a.status === "SUCCESS" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]" :
                      a.status === "WARNING" ? "bg-amber-400" : "bg-red-400"
                    }`} />
                    <span className="text-xs text-slate-300 truncate">{a.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{new Date(a.createdAt || a.time).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
