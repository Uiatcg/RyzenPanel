"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ToggleLeft, ToggleRight, Save, Check, Coins, Users,
  MessageSquare, Volume2, Megaphone, Ticket, Server,
} from "lucide-react";

interface Settings {
  panelName: string;
  logoUrl: string;
  primaryColor: string;
  creditsEnabled: boolean;
  freeServersEnabled: boolean;
  adRewardCredits: number;
  dailyRewardCredits: number;
  communityEnabled: boolean;
  audioEnabled: boolean;
  audioUrl: string;
  announcementsEnabled: boolean;
  ticketsEnabled: boolean;
}

const defaultSettings: Settings = {
  panelName: "RYZENPANEL",
  logoUrl: "/favicon.svg",
  primaryColor: "#ef4444",
  creditsEnabled: true,
  freeServersEnabled: true,
  adRewardCredits: 10,
  dailyRewardCredits: 5,
  communityEnabled: true,
  audioEnabled: false,
  audioUrl: "",
  announcementsEnabled: true,
  ticketsEnabled: true,
};

export default function AdminTogglesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { setSettings(prev => ({ ...prev, ...d })); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  function Toggle({ enabled, onToggle, label, description, icon: Icon }: {
    enabled: boolean; onToggle: () => void; label: string; description: string; icon: any;
  }) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-slate-800/20 p-4 hover:bg-slate-800/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${enabled ? "bg-emerald-500/10" : "bg-slate-700/30"}`}>
            <Icon size={18} className={enabled ? "text-emerald-400" : "text-slate-500"} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <button onClick={onToggle}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            enabled ? "bg-emerald-500" : "bg-slate-700"
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-6"><div className="skeleton h-96" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm">
            <ToggleLeft size={30} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Feature Toggles</h1>
            <p className="text-sm text-slate-400 mt-1">Enable or disable panel features</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white mb-2">System Features</h3>
        <Toggle
          enabled={settings.freeServersEnabled}
          onToggle={() => setSettings({ ...settings, freeServersEnabled: !settings.freeServersEnabled })}
          label="Free Server Creation"
          description="Allow users to create servers for free"
          icon={Server}
        />
        <Toggle
          enabled={settings.creditsEnabled}
          onToggle={() => setSettings({ ...settings, creditsEnabled: !settings.creditsEnabled })}
          label="Credits System"
          description="Enable earning and spending credits"
          icon={Coins}
        />
        <Toggle
          enabled={settings.announcementsEnabled}
          onToggle={() => setSettings({ ...settings, announcementsEnabled: !settings.announcementsEnabled })}
          label="Announcements"
          description="Show announcements to users"
          icon={Megaphone}
        />
        <Toggle
          enabled={settings.ticketsEnabled}
          onToggle={() => setSettings({ ...settings, ticketsEnabled: !settings.ticketsEnabled })}
          label="Support Tickets"
          description="Allow users to create support tickets"
          icon={Ticket}
        />
        <Toggle
          enabled={settings.communityEnabled}
          onToggle={() => setSettings({ ...settings, communityEnabled: !settings.communityEnabled })}
          label="Community Page"
          description="Show community chat and members"
          icon={Users}
        />
        <Toggle
          enabled={settings.audioEnabled}
          onToggle={() => setSettings({ ...settings, audioEnabled: !settings.audioEnabled })}
          label="Background Audio"
          description="Play background audio on the dashboard"
          icon={Volume2}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white mb-2">Credits Configuration</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-400">Daily Reward (credits)</label>
            <input type="number" value={settings.dailyRewardCredits}
              onChange={e => setSettings({ ...settings, dailyRewardCredits: parseInt(e.target.value) || 0 })}
              className="input-field mt-1.5" min="0" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Ad Reward (credits)</label>
            <input type="number" value={settings.adRewardCredits}
              onChange={e => setSettings({ ...settings, adRewardCredits: parseInt(e.target.value) || 0 })}
              className="input-field mt-1.5" min="0" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white mb-2">Audio Settings</h3>
        <div>
          <label className="text-xs font-medium text-slate-400">Audio URL</label>
          <input value={settings.audioUrl}
            onChange={e => setSettings({ ...settings, audioUrl: e.target.value })}
            className="input-field mt-1.5" placeholder="https://example.com/audio.mp3" />
          <p className="text-[10px] text-slate-500 mt-1">URL to background audio file (MP3/WAV)</p>
        </div>
      </motion.div>

      <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
        {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  );
}
