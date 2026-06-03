"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Radio, Terminal, Copy, Check, Shield, Wifi, Globe, RefreshCw } from "lucide-react";

export default function DaemonSettingsPage() {
  const [copied, setCopied] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const configLines = [
    "panel_url: http://localhost:3000",
    "daemon_port: 8080",
    "daemon_host: 0.0.0.0",
    "data_root: /var/lib/ryzenpanel",
    "docker_socket: /var/run/docker.sock",
    "",
    "# Authentication",
    "daemon_key: your-daemon-api-key",
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/40 border border-slate-800/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20">
            <Radio size={28} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Daemon Configuration</h1>
            <p className="text-sm text-slate-400 mt-1">Configure RyzenDaemon connection settings</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <Globe size={18} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Connection Details</h3>
            <p className="text-xs text-slate-500">Current daemon network configuration</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Daemon Host</label>
            <p className="text-sm font-mono text-white mt-1">0.0.0.0</p>
          </div>
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Daemon Port</label>
            <p className="text-sm font-mono text-white mt-1">8080</p>
          </div>
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">SSL Enabled</label>
            <p className="text-sm font-mono text-white mt-1">No (development)</p>
          </div>
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Docker Socket</label>
            <p className="text-sm font-mono text-white mt-1">/var/run/docker.sock</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-ryzen-500/10 p-2">
            <Terminal size={18} className="text-ryzen-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Daemon Config File</h3>
            <p className="text-xs text-slate-500">Example configuration for ryzendaemon</p>
          </div>
        </div>

        <div className="relative">
          <pre className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
            <code>{configLines.join("\n")}</code>
          </pre>
          <button onClick={() => copyToClipboard(configLines.join("\n"))}
            className="absolute top-2 right-2 rounded-lg bg-slate-800 p-2 hover:bg-slate-700 transition-colors">
            {copied ? <Check size={14} className="text-ryzen-400" /> : <Copy size={14} className="text-slate-400" />}
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-amber-500/10 p-2">
            <Shield size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Security</h3>
            <p className="text-xs text-slate-500">Authentication and authorization</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-slate-300">Daemon API Key</p>
              <p className="text-[10px] text-slate-500">Used for panel-to-daemon authentication</p>
            </div>
            <button className="btn-ghost text-xs">
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-slate-300">Node Token</p>
              <p className="text-[10px] text-slate-500">Used for daemon-to-panel authentication</p>
            </div>
            <button className="btn-ghost text-xs">
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
