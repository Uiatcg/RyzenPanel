"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, Check, Server, Package, Cpu,
  FileText, Rocket, HardDrive, MemoryStick, Globe, Type,
  Diamond, Sword, Shield, Pickaxe, Zap,
} from "lucide-react";

const softwareOptions = [
  { id: "paper", name: "Paper", desc: "High performance Spigot fork", icon: "📄", block: "mc-block-paper", rarity: "rare" },
  { id: "purpur", name: "Purpur", desc: "Optimized with extra features", icon: "💜", block: "mc-block-end", rarity: "epic" },
  { id: "spigot", name: "Spigot", desc: "Most widely used server software", icon: "🍖", block: "mc-block-wood", rarity: "common" },
  { id: "vanilla", name: "Vanilla", desc: "Official Minecraft server", icon: "🌿", block: "mc-block-grass", rarity: "common" },
  { id: "fabric", name: "Fabric", desc: "Lightweight mod loader", icon: "🧵", block: "mc-block-iron", rarity: "uncommon" },
  { id: "forge", name: "Forge", desc: "Popular modding platform", icon: "⚒️", block: "mc-block-gold", rarity: "rare" },
  { id: "neoforge", name: "NeoForge", desc: "Next-gen Forge fork", icon: "🔥", block: "mc-block-lava", rarity: "epic" },
  { id: "velocity", name: "Velocity", desc: "Modern proxy server", icon: "💨", block: "mc-block-water", rarity: "uncommon" },
  { id: "waterfall", name: "Waterfall", desc: "BungeeCord fork", icon: "🌊", block: "mc-block-water", rarity: "common" },
  { id: "bungeecord", name: "BungeeCord", desc: "Network proxy", icon: "🔗", block: "mc-block-iron", rarity: "common" },
];

interface VersionGroup {
  era: string;
  color: string;
  icon: string;
  versions: string[];
}

const versionGroups: VersionGroup[] = [
  { era: "Modern (1.21.x)", color: "from-violet-600 to-blue-600", icon: "⚡", versions: ["1.21.4", "1.21.3", "1.21.1", "1.21"] },
  { era: "Trails & Tales (1.20.x)", color: "from-blue-600 to-cyan-600", icon: "🏰", versions: ["1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1", "1.20"] },
  { era: "The Wild (1.19.x)", color: "from-cyan-600 to-emerald-600", icon: "🗡️", versions: ["1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19"] },
  { era: "Caves & Cliffs (1.17-1.18)", color: "from-emerald-600 to-green-600", icon: "⛏️", versions: ["1.18.2", "1.18.1", "1.18", "1.17.1", "1.17"] },
  { era: "Nether Update (1.16.x)", color: "from-orange-600 to-red-600", icon: "💀", versions: ["1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16"] },
  { era: "Older (1.12-1.15)", color: "from-amber-600 to-yellow-600", icon: "📦", versions: ["1.15.2", "1.14.4", "1.13.2", "1.12.2"] },
];

const proxyVersionGroups: VersionGroup[] = [
  { era: "Velocity 3.x", color: "from-cyan-600 to-blue-600", icon: "🚀", versions: ["3.4", "3.3", "3.2", "3.1"] },
  { era: "Waterfall / BungeeCord", color: "from-blue-600 to-indigo-600", icon: "🌊", versions: ["latest"] },
];

// Full version lists per software type
const versions: Record<string, string[]> = {
  paper: ["1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1", "1.20", "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1", "1.18", "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16", "1.15.2", "1.14.4", "1.13.2", "1.12.2"],
  purpur: ["1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1", "1.20", "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1", "1.18", "1.17.1", "1.17", "1.16.5"],
  spigot: ["1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1", "1.20", "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1", "1.18", "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16", "1.15.2", "1.14.4", "1.13.2", "1.12.2"],
  vanilla: ["1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1", "1.20", "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1", "1.18", "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16", "1.15.2", "1.14.4", "1.13.2", "1.12.2"],
  fabric: ["1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1", "1.20", "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1", "1.18", "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16", "1.15.2", "1.14.4"],
  forge: ["1.20.4", "1.20.1", "1.19.4", "1.19.2", "1.18.2", "1.17.1", "1.16.5", "1.15.2", "1.14.4", "1.13.2", "1.12.2"],
  neoforge: ["1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.5", "1.20.4", "1.20.2", "1.20.1"],
  velocity: ["3.4", "3.3", "3.2", "3.1"],
  waterfall: ["latest"],
  bungeecord: ["latest"],
};

const rarityConfig: Record<string, { color: string; border: string; bg: string }> = {
  common: { color: "text-slate-400", border: "border-slate-400/20", bg: "bg-slate-400/5" },
  uncommon: { color: "text-cyan-400", border: "border-cyan-400/20", bg: "bg-cyan-400/5" },
  rare: { color: "text-blue-400", border: "border-blue-400/20", bg: "bg-blue-400/5" },
  epic: { color: "text-purple-400", border: "border-purple-400/20", bg: "bg-purple-400/5" },
  legendary: { color: "text-amber-400", border: "border-amber-400/20", bg: "bg-amber-400/5" },
};

const steps = [
  { id: 0, title: "Name", icon: Type },
  { id: 1, title: "Type", icon: Package },
  { id: 2, title: "Version", icon: FileText },
  { id: 3, title: "Node", icon: Globe },
  { id: 4, title: "RAM", icon: MemoryStick },
  { id: 5, title: "CPU", icon: Cpu },
  { id: 6, title: "Disk", icon: HardDrive },
  { id: 7, title: "Deploy", icon: Rocket },
];

export default function CreateServerWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [software, setSoftware] = useState("");
  const [version, setVersion] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [nodes, setNodes] = useState<Array<{ id: string; name: string; fqdn: string; status: string; maxRam: number; maxDisk: number; maxServers: number; serverCount: number }>>([]);
  const [ram, setRam] = useState(2048);
  const [cpu, setCpu] = useState(100);
  const [disk, setDisk] = useState(10240);
  const [backups, setBackups] = useState(2);
  const [databases, setDatabases] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/nodes").then(r => r.json()).then(d => {
      setNodes(d.nodes || []);
      if (d.nodes?.length > 0) setNodeId(d.nodes[0].id);
    }).catch(() => {});
  }, []);

  function canProceed() {
    if (step === 0) return name.trim().length >= 3;
    if (step === 1) return software !== "";
    if (step === 2) return version !== "";
    if (step === 3) return nodeId !== "";
    if (step === 4) return ram >= 1024;
    if (step === 5) return cpu >= 50;
    if (step === 6) return disk >= 1024;
    return true;
  }

  async function handleDeploy() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, software, version, nodeId, ram, cpu, disk, backups, databases }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.message || "Failed to create server");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/my-servers");
  }

  const dockerImages: Record<string, string> = {
    paper: "itzg/minecraft-server", purpur: "itzg/minecraft-server",
    spigot: "itzg/minecraft-server", vanilla: "itzg/minecraft-server",
    fabric: "itzg/minecraft-server", forge: "itzg/minecraft-server",
    neoforge: "itzg/minecraft-server", velocity: "itzg/velocity",
    waterfall: "itzg/waterfall", bungeecord: "itzg/bungeecord",
  };

  const selectedSoftware = softwareOptions.find(o => o.id === software);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 mb-8 ryzen-glow"
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 opacity-[0.04]">
          <div className="mc-block mc-block-diamond w-full h-full text-6xl flex items-center justify-center rotate-12">◆</div>
        </div>
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow-sm animate-float">
            <Rocket size={30} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Server</h1>
            <p className="text-sm text-slate-400 mt-1">Deploy a new Minecraft server in minutes</p>
          </div>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center min-w-[640px]">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1.5 ${i <= step ? "text-ryzen-400" : "text-slate-600"}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 shrink-0 ${
                  i < step ? "bg-ryzen-500 text-white scale-100" :
                  i === step ? "bg-ryzen-500/20 text-ryzen-400 border border-ryzen-500/30 scale-110 ryzen-glow-sm" :
                  "bg-slate-800/50 text-slate-600 border border-slate-700/30"
                }`}>
                  {i < step ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${i === step ? "text-ryzen-400" : ""}`}>{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 ${i < step ? "bg-gradient-to-r from-ryzen-500/50 to-ryzen-500/20" : "bg-slate-800"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Body */}
      <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 min-h-[440px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">⛏️ Server Name</h2>
                <p className="text-sm text-slate-400 mt-1">Choose a name for your Minecraft server</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><span>📝</span> Server Name</label>
                <div className="relative mt-1.5">
                  <Type size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="input-field pl-10 text-base bg-slate-800/50 border-slate-700/30 focus:border-ryzen-500/30"
                    placeholder="My Awesome Server" required minLength={3} autoFocus />
                </div>
                <p className="text-xs text-slate-500 mt-2">Must be at least 3 characters</p>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-ryzen-500/5 to-ryzen-500/[0.02] border border-ryzen-500/10 p-4">
                <p className="text-xs text-slate-400">
                  <span className="text-ryzen-400 font-medium">💡 Tip:</span> Choose a descriptive name. You can change it later.
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">🎮 Server Type</h2>
                <p className="text-sm text-slate-400">Select the server software</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {softwareOptions.map(opt => {
                  const rarity = rarityConfig[opt.rarity] || rarityConfig.common;
                  const isSelected = software === opt.id;
                  return (
                    <button key={opt.id} onClick={() => { setSoftware(opt.id); setVersion(""); }}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? `${rarity.border} ${rarity.bg} shadow-sm`
                          : "border-slate-700/30 hover:border-slate-600/50 bg-slate-900/50 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className={`mc-block ${opt.block} w-10 h-10 text-lg shrink-0`}>
                        <span className="relative z-10">{opt.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{opt.name}</p>
                          <span className={`text-[9px] font-bold uppercase ${rarity.color}`}>{opt.rarity}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">📦 Minecraft Version</h2>
                <p className="text-sm text-slate-400">Select version for <strong className="text-ryzen-400">{selectedSoftware?.name}</strong></p>
              </div>
              {software === "velocity" || software === "waterfall" || software === "bungeecord" ? (
                <div className="space-y-4">
                  {proxyVersionGroups.map(group => (
                    <div key={group.era}>
                      <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                        <span>{group.icon}</span> {group.era}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-4">
                        {(versions[software] || ["latest"]).map(v => {
                          const isSelected = version === v;
                          return (
                            <button key={v} onClick={() => setVersion(v)}
                              className={`relative rounded-xl border p-4 text-center transition-all duration-200 overflow-hidden group ${
                                isSelected
                                  ? "border-ryzen-500/50 bg-gradient-to-b from-ryzen-500/10 to-transparent shadow-sm shadow-ryzen-500/10 ryzen-glow-sm"
                                  : "border-slate-700/30 hover:border-slate-600/50 bg-slate-900/50 hover:bg-slate-800/50"
                              }`}
                            >
                              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${group.color}`} />
                              <div className="text-3xl mb-2">{group.icon}</div>
                              <p className={`text-base font-bold ${isSelected ? "text-ryzen-400" : "text-white"}`}>
                                {v === "latest" ? "Latest" : v}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">{selectedSoftware?.name}</p>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-ryzen-500 rounded-bl-lg flex items-center justify-center">
                                  <Check size={10} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
                  {versionGroups.map(group => {
                    const availableVersions = (versions[software] || []).filter(v => group.versions.includes(v));
                    if (availableVersions.length === 0) return null;
                    return (
                      <div key={group.era}>
                        <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                          <span>{group.icon}</span> {group.era}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-4">
                          {availableVersions.map(v => {
                            const isSelected = version === v;
                            return (
                              <button key={v} onClick={() => setVersion(v)}
                                className={`relative rounded-lg border p-3 text-center transition-all duration-200 group ${
                                  isSelected
                                    ? "border-ryzen-500/50 bg-gradient-to-b from-ryzen-500/10 to-transparent shadow-sm shadow-ryzen-500/10"
                                    : "border-slate-700/30 hover:border-slate-600/50 bg-slate-900/50 hover:bg-slate-800/50"
                                }`}
                              >
                                <p className={`text-sm font-bold ${isSelected ? "text-ryzen-400" : "text-white"}`}>{v}</p>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-ryzen-500 rounded-bl-lg flex items-center justify-center">
                                    <Check size={8} className="text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedSoftware && (
                <div className="rounded-xl bg-slate-800/30 border border-slate-700/20 px-4 py-3">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>🐳 Docker image:</span>
                    <code className="text-ryzen-400 bg-ryzen-500/5 px-2 py-0.5 rounded-md font-mono">{dockerImages[software]}</code>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">🌍 Select Node</h2>
                <p className="text-sm text-slate-400">Choose which daemon node to deploy on</p>
              </div>
              {nodes.length === 0 ? (
                <div className="rounded-xl bg-slate-800/30 border border-slate-700/20 p-8 text-center">
                  <Globe size={28} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">No nodes available. Add a node in admin panel first.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {nodes.map(n => {
                    const isOnline = n.status === "online";
                    const isSelected = nodeId === n.id;
                    return (
                      <button key={n.id} onClick={() => setNodeId(n.id)} disabled={!isOnline}
                        className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-ryzen-500/50 bg-gradient-to-r from-ryzen-500/10 to-transparent shadow-sm shadow-ryzen-500/10"
                            : "border-slate-700/30 hover:border-slate-600/50 bg-slate-900/50"
                        } ${!isOnline ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <div className={`mc-block ${isOnline ? "mc-block-grass" : "mc-block-stone"} w-10 h-10 shrink-0`}>
                          <Globe size={20} className="text-white relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{n.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{n.fqdn}</p>
                          <div className="flex gap-3 mt-1.5 text-[10px] text-slate-500">
                            <span>💾 {n.maxRam >= 1024 ? `${(n.maxRam / 1024).toFixed(0)}G` : `${n.maxRam}M`} RAM</span>
                            <span>📀 {n.maxDisk >= 1024 ? `${(n.maxDisk / 1024).toFixed(0)}G` : `${n.maxDisk}M`} Disk</span>
                            <span>📊 {n.serverCount}/{n.maxServers} servers</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium border ${
                          isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700/30"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-600"}`} />
                          {isOnline ? "Online" : "Offline"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">🧠 RAM Allocation</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate memory for your server</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-b from-slate-800/30 to-transparent border border-slate-700/20 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-end justify-center gap-1">
                    <MemoryStick size={28} className="text-ryzen-400 mb-1" />
                    <span className="text-5xl font-bold text-white font-mono tracking-tight">
                      {ram >= 1024 ? `${(ram / 1024).toFixed(0)}` : ram}
                    </span>
                    <span className="text-lg text-slate-400 mb-1">{ram >= 1024 ? "GB" : "MB"}</span>
                  </div>
                </div>
                <input type="range" min={1024} max={32768} step={256} value={ram}
                  onChange={e => setRam(Number(e.target.value))}
                  className="w-full accent-ryzen-500 h-2" />
                <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                  <span>1G</span><span>4G</span><span>8G</span><span>16G</span><span>32G</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">⚡ CPU Allocation</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate CPU resources</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-b from-slate-800/30 to-transparent border border-slate-700/20 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-end justify-center gap-1">
                    <Cpu size={28} className="text-ryzen-400 mb-1" />
                    <span className="text-5xl font-bold text-white font-mono tracking-tight">{cpu}</span>
                    <span className="text-lg text-slate-400 mb-1">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{cpu >= 100 ? `${cpu / 100} core${cpu >= 200 ? "s" : ""}` : "Less than 1 core"}</p>
                </div>
                <input type="range" min={50} max={400} step={50} value={cpu}
                  onChange={e => setCpu(Number(e.target.value))}
                  className="w-full accent-ryzen-500 h-2" />
                <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                  <span>0.5</span><span>1</span><span>2</span><span>3</span><span>4</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">💾 Disk Allocation</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate storage space</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-b from-slate-800/30 to-transparent border border-slate-700/20 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-end justify-center gap-1">
                    <HardDrive size={28} className="text-ryzen-400 mb-1" />
                    <span className="text-5xl font-bold text-white font-mono tracking-tight">
                      {disk >= 1024 ? (disk / 1024).toFixed(0) : disk}
                    </span>
                    <span className="text-lg text-slate-400 mb-1">{disk >= 1024 ? "GB" : "MB"}</span>
                  </div>
                </div>
                <input type="range" min={1024} max={102400} step={1024} value={disk}
                  onChange={e => setDisk(Number(e.target.value))}
                  className="w-full accent-ryzen-500 h-2" />
                <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                  <span>1G</span><span>10G</span><span>25G</span><span>50G</span><span>100G</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><span>💾</span> Backups</label>
                  <select value={backups} onChange={e => setBackups(Number(e.target.value))}
                    className="input-field mt-1.5 bg-slate-800/50 border-slate-700/30">
                    {[0, 1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><span>🗄️</span> Databases</label>
                  <select value={databases} onChange={e => setDatabases(Number(e.target.value))}
                    className="input-field mt-1.5 bg-slate-800/50 border-slate-700/30">
                    {[0, 1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="text-center py-4">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/15 to-red-600/10 border-2 border-ryzen-500/15 ryzen-glow-sm animate-float">
                  <Rocket size={36} className="text-ryzen-400" />
                </div>
                <h2 className="text-xl font-bold text-white">🚀 Ready to Deploy</h2>
                <p className="text-sm text-slate-400 mt-2">Review your configuration before deploying</p>
              </div>

              <div className="space-y-1.5">
                {([
                  ["Server Name", name],
                  ["Software", selectedSoftware ? `${selectedSoftware.icon} ${selectedSoftware.name}` : software],
                  ["Version", `Minecraft ${version}`],
                  ["Node", nodes.find(n => n.id === nodeId)?.name || nodeId],
                  ["RAM", `${ram >= 1024 ? `${(ram / 1024).toFixed(0)} GB` : `${ram} MB`}`],
                  ["CPU", `${cpu}% ${cpu >= 100 ? `(${cpu / 100} core${cpu >= 200 ? "s" : ""})` : ""}`],
                  ["Disk", `${disk >= 1024 ? `${(disk / 1024).toFixed(0)} GB` : `${disk} MB`}`],
                  ["Backups", String(backups)],
                  ["Databases", String(databases)],
                  ["Docker Image", dockerImages[software] || "auto"],
                ] as const).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3 border border-slate-700/10">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                  <span>⛔</span> {error}
                </div>
              )}

              <button onClick={handleDeploy} disabled={loading}
                className="btn-primary w-full py-4 text-base relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Deploying Server...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Rocket size={18} /> ⛏️ Deploy Server</span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="flex items-center gap-2 rounded-xl border border-slate-700/30 bg-slate-900/50 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Step {step + 1} of {steps.length}</span>
          {step < 7 ? (
            <button onClick={() => setStep(Math.min(7, step + 1))} disabled={!canProceed()}
              className="btn-primary group"
            >
              Continue <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
