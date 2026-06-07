"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Save, Check, Image, Video, Type, Image as ImageIcon } from "lucide-react";

export default function BrandSettingsPage() {
  const [settings, setSettings] = useState<any>({
    panelName: "RYZENPANEL",
    logoUrl: "/favicon.svg",
    primaryColor: "#ef4444",
    heroImageUrl: "",
    heroVideoUrl: "",
    bannerUrl: "",
    tagline: "The ultimate Minecraft server hosting experience. Deploy, manage, and scale your servers with ease.",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (d.panelName) setSettings((prev: any) => ({ ...prev, ...d }));
        setLoading(false);
      })
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

  function FieldPreview({ label, url }: { label: string; url: string }) {
    if (!url) return null;
    return (
      <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-800/50 border border-slate-700/30 p-3">
        <img src={url} alt={label} className="h-10 w-10 rounded-lg object-cover bg-slate-900" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="text-xs text-slate-400">{label} preview</span>
      </div>
    );
  }

  if (loading) return <div className="p-6"><div className="skeleton h-96" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm">
            <Palette size={30} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Brand Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Customize your panel appearance</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 space-y-6"
      >
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Type size={14} className="text-ryzen-400" />
          Identity
        </h3>

        <div>
          <label className="text-xs font-medium text-slate-400">Panel Name</label>
          <input value={settings.panelName}
            onChange={e => setSettings({ ...settings, panelName: e.target.value })}
            className="input-field mt-1.5" placeholder="RYZENPANEL" />
          <p className="text-[10px] text-slate-500 mt-1">Shown in browser title and sidebar</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Tagline</label>
          <input value={settings.tagline || ""}
            onChange={e => setSettings({ ...settings, tagline: e.target.value })}
            className="input-field mt-1.5" placeholder="Premium Minecraft hosting..." />
          <p className="text-[10px] text-slate-500 mt-1">Shown on the home page hero</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Primary Color</label>
          <div className="flex items-center gap-3 mt-1.5">
            <input type="color" value={settings.primaryColor}
              onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
              className="h-10 w-10 rounded-lg border border-slate-700/30 cursor-pointer bg-transparent" />
            <input value={settings.primaryColor}
              onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
              className="input-field flex-1 font-mono" placeholder="#ef4444" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 space-y-6"
      >
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Image size={14} className="text-ryzen-400" />
          Images & Media
        </h3>

        <div>
          <label className="text-xs font-medium text-slate-400">Logo URL</label>
          <input value={settings.logoUrl}
            onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
            className="input-field mt-1.5" placeholder="/favicon.svg" />
          <p className="text-[10px] text-slate-500 mt-1">URL to your logo image (SVG or PNG)</p>
          <FieldPreview label="Logo" url={settings.logoUrl} />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Banner URL</label>
          <input value={settings.bannerUrl || ""}
            onChange={e => setSettings({ ...settings, bannerUrl: e.target.value })}
            className="input-field mt-1.5" placeholder="https://i.imgur.com/your-banner.png" />
          <p className="text-[10px] text-slate-500 mt-1">Wide banner image shown in announcements</p>
          {settings.bannerUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-700/30">
              <img src={settings.bannerUrl} alt="Banner preview" className="w-full h-24 object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Home Page Hero Image</label>
          <input value={settings.heroImageUrl || ""}
            onChange={e => setSettings({ ...settings, heroImageUrl: e.target.value })}
            className="input-field mt-1.5" placeholder="https://i.imgur.com/your-hero.png" />
          <p className="text-[10px] text-slate-500 mt-1">Background image for the home hero section</p>
          {settings.heroImageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-700/30">
              <img src={settings.heroImageUrl} alt="Hero preview" className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Home Page Hero Video</label>
          <input value={settings.heroVideoUrl || ""}
            onChange={e => setSettings({ ...settings, heroVideoUrl: e.target.value })}
            className="input-field mt-1.5" placeholder="https://example.com/your-video.mp4" />
          <p className="text-[10px] text-slate-500 mt-1">Background video (MP4) — takes priority over image</p>
        </div>
      </motion.div>

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/20 p-4">
        <p className="text-xs text-slate-500">
          <span className="text-ryzen-400 font-medium">Note:</span> The "RYZENPANEL" brand watermark and "Made with ❤️ by RtxRyzen / RtxRyzenx3D" footer are permanent and cannot be removed.
        </p>
      </div>

      <button onClick={handleSave}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  );
}
