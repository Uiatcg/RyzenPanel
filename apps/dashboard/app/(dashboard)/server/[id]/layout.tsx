"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity, Terminal, FolderOpen, Settings, Sliders,
  Clock, HardDrive, Database, Globe, List, ChevronLeft,
  Radio, Wifi, WifiOff,
} from "lucide-react";

const tabs = [
  { id: "", label: "Overview", icon: Activity },
  { id: "console", label: "Console", icon: Terminal },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "startup", label: "Startup", icon: Settings },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "backups", label: "Backups", icon: HardDrive },
  { id: "databases", label: "Databases", icon: Database },
  { id: "network", label: "Network", icon: Globe },
  { id: "activity", label: "Activity", icon: List },
  { id: "settings", label: "Settings", icon: Sliders },
];

export default function ServerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentTab = tabs.find(t => pathname === `/server/${params.id}` || pathname === `/server/${params.id}/${t.id}`);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/servers/${params.id}`).then(r => r.ok ? r.json() : null).then(d => {
      if (!d) router.push("/my-servers");
      else setServer(d);
      setLoading(false);
    }).catch(() => { setLoading(false); router.push("/my-servers"); });
  }, [params.id, router]);

  async function handlePowerAction(action: string) {
    await fetch(`/api/servers/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  }

  if (loading) {
    return <div className="p-6 space-y-4"><div className="skeleton h-12 w-full" /><div className="skeleton h-96" /></div>;
  }

  if (!server) return null;

  const statusColors: Record<string, string> = {
    ONLINE: "bg-ryzen-400", OFFLINE: "bg-red-400", STARTING: "bg-yellow-400",
    STOPPING: "bg-yellow-400", RESTARTING: "bg-yellow-400", SUSPENDED: "bg-red-400",
    INSTALLING: "bg-blue-400", INSTALL_FAILED: "bg-red-400",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/my-servers" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-3">
          <ChevronLeft size={14} /> Back to Servers
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{server.name}</h1>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusColors[server.status] || "bg-slate-500"}`} />
              <span className="text-xs font-medium text-slate-400">{server.status}</span>
            </div>
            {server.node && (
              <Link href="/wings" className="flex items-center gap-1 rounded-lg bg-slate-800/50 px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors">
                <Radio size={10} className="text-violet-400" />
                {server.node.fqdn}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePowerAction("start")} className="btn-primary text-xs px-3 py-2">Start</button>
            <button onClick={() => handlePowerAction("stop")} className="btn-secondary text-xs px-3 py-2">Stop</button>
            <button onClick={() => handlePowerAction("restart")} className="btn-secondary text-xs px-3 py-2">Restart</button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-800/50 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = pathname === `/server/${params.id}${tab.id ? `/${tab.id}` : ""}`;
          return (
            <Link key={tab.id} href={`/server/${params.id}${tab.id ? `/${tab.id}` : ""}`}
              className={`tab whitespace-nowrap ${isActive ? "tab-active" : ""}`}
            >
              <tab.icon size={14} className="inline mr-1.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={pathname}>
        {children}
      </motion.div>
    </div>
  );
}
