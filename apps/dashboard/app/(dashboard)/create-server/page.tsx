"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, Check, Server, Package, Cpu,
  FileText, Rocket, HardDrive, MemoryStick, Globe, Type,
} from "lucide-react";

const softwareOptions = [
  { id: "paper", name: "Paper", desc: "High performance Spigot fork" },
  { id: "purpur", name: "Purpur", desc: "Optimized with extra features" },
  { id: "spigot", name: "Spigot", desc: "Most widely used server software" },
  { id: "vanilla", name: "Vanilla", desc: "Official Minecraft server" },
  { id: "fabric", name: "Fabric", desc: "Lightweight mod loader" },
  { id: "forge", name: "Forge", desc: "Popular modding platform" },
  { id: "neoforge", name: "NeoForge", desc: "Next-gen Forge fork" },
  { id: "velocity", name: "Velocity", desc: "Modern proxy server" },
  { id: "waterfall", name: "Waterfall", desc: "BungeeCord fork" },
  { id: "bungeecord", name: "BungeeCord", desc: "Network proxy" },
];

const versions: Record<string, string[]> = {
  paper: ["1.21", "1.20.4", "1.19.4", "1.18.2", "1.17.1", "1.16.5"],
  purpur: ["1.21", "1.20.4", "1.19.4", "1.18.2"],
  spigot: ["1.21", "1.20.4", "1.19.4", "1.18.2", "1.16.5"],
  vanilla: ["1.21", "1.20.4", "1.19.4", "1.18.2", "1.17.1", "1.16.5"],
  fabric: ["1.21", "1.20.4", "1.19.4", "1.18.2"],
  forge: ["1.20.4", "1.19.4", "1.18.2", "1.16.5"],
  neoforge: ["1.21", "1.20.4"],
  velocity: ["3.3", "3.2", "3.1"],
  waterfall: ["1.21", "1.20", "1.19"],
  bungeecord: ["1.21", "1.20", "1.19"],
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
    paper: "itzg/minecraft-server",
    purpur: "itzg/minecraft-server",
    spigot: "itzg/minecraft-server",
    vanilla: "itzg/minecraft-server",
    fabric: "itzg/minecraft-server",
    forge: "itzg/minecraft-server",
    neoforge: "itzg/minecraft-server",
    velocity: "itzg/velocity",
    waterfall: "itzg/waterfall",
    bungeecord: "itzg/bungeecord",
  };

  const selectedSoftware = softwareOptions.find(o => o.id === software);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/50 p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ryzen-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-emerald-600/20 border border-ryzen-500/20">
            <Rocket size={28} className="text-ryzen-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Server</h1>
            <p className="text-sm text-slate-400 mt-1">Deploy a new Minecraft server in minutes</p>
          </div>
        </div>
      </div>

      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? "text-ryzen-400" : "text-slate-600"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all shrink-0 ${
                  i < step ? "bg-ryzen-500 text-white" : i === step ? "bg-ryzen-500/20 text-ryzen-400 border border-ryzen-500/30" : "bg-slate-800 text-slate-600"
                }`}>
                  {i < step ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{s.title}</span>
              </div>
              {i < steps.length - 1 && <div className={`mx-2 h-px w-6 sm:w-12 ${i < step ? "bg-ryzen-500/50" : "bg-slate-800"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="card min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Server Name</h2>
                <p className="text-sm text-slate-400 mt-1">Choose a name for your Minecraft server</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">Server Name</label>
                <div className="relative mt-1.5">
                  <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="input-field pl-10 text-base" placeholder="My Awesome Server" required minLength={3} autoFocus />
                </div>
                <p className="text-xs text-slate-500 mt-2">Must be at least 3 characters</p>
              </div>
              <div className="rounded-xl bg-ryzen-500/5 border border-ryzen-500/10 p-4">
                <p className="text-xs text-slate-400">
                  <span className="text-ryzen-400 font-medium">Tip:</span> Choose a name that represents your server well. You can change it later.
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Server Type</h2>
              <p className="text-sm text-slate-400">Select the server software you want to run</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {softwareOptions.map(opt => (
                  <button key={opt.id} onClick={() => { setSoftware(opt.id); setVersion(""); }}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      software === opt.id
                        ? "border-ryzen-500/50 bg-ryzen-500/10 shadow-sm shadow-ryzen-500/10"
                        : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                      software === opt.id ? "bg-ryzen-500/20 text-ryzen-400" : "bg-slate-800 text-slate-500"
                    }`}>
                      {opt.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{opt.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Minecraft Version</h2>
              <p className="text-sm text-slate-400">Select the version for your {selectedSoftware?.name || "Minecraft"} server</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(versions[software] || ["1.21", "1.20.4", "1.19.4"]).map(v => (
                  <button key={v} onClick={() => setVersion(v)}
                    className={`rounded-xl border p-4 text-center transition-all ${
                      version === v
                        ? "border-ryzen-500/50 bg-ryzen-500/10 shadow-sm shadow-ryzen-500/10"
                        : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                    }`}
                  >
                    <p className="text-lg font-bold text-white">MC {v}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedSoftware?.name}</p>
                  </button>
                ))}
              </div>
              {software && (
                <div className="rounded-xl bg-slate-800/30 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Docker image: <code className="text-ryzen-400">{dockerImages[software]}</code>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Select Node</h2>
              <p className="text-sm text-slate-400">Choose which Wings node to deploy this server on</p>
              {nodes.length === 0 ? (
                <div className="rounded-xl bg-ryzen-500/5 border border-ryzen-500/10 p-6 text-center">
                  <Globe size={24} className="mx-auto text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">No nodes available. Add a node in the admin panel first.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {nodes.map(n => {
                    const selected = nodeId === n.id;
                    const isOnline = n.status === "online";
                    return (
                      <button key={n.id} onClick={() => setNodeId(n.id)} disabled={!isOnline}
                        className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                          selected ? "border-ryzen-500/50 bg-ryzen-500/10 shadow-sm shadow-ryzen-500/10" : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                        } ${!isOnline ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                          isOnline ? "bg-green-500/10" : "bg-slate-800"
                        }`}>
                          <Globe size={20} className={isOnline ? "text-green-400" : "text-slate-500"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{n.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{n.fqdn}</p>
                          <div className="flex gap-3 mt-1.5 text-[10px] text-slate-500">
                            <span>{n.maxRam >= 1024 ? `${(n.maxRam / 1024).toFixed(0)}G` : `${n.maxRam}M`} RAM</span>
                            <span>{n.maxDisk >= 1024 ? `${(n.maxDisk / 1024).toFixed(0)}G` : `${n.maxDisk}M`} Disk</span>
                            <span>{n.serverCount}/{n.maxServers} Servers</span>
                          </div>
                        </div>
                        <div className={`badge ${isOnline ? "badge-green" : "badge-red"}`}>
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
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">RAM Allocation</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate memory for your server</p>
              </div>
              <div className="card bg-slate-800/20 border-slate-700/30">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center gap-2">
                    <MemoryStick size={24} className="text-ryzen-400" />
                    <span className="text-4xl font-bold text-white">{ram >= 1024 ? `${(ram / 1024).toFixed(0)}` : ram}</span>
                    <span className="text-lg text-slate-400">{ram >= 1024 ? "GB" : "MB"}</span>
                  </div>
                </div>
                <input type="range" min={1024} max={32768} step={256} value={ram}
                  onChange={e => setRam(Number(e.target.value))}
                  className="w-full accent-ryzen-500" />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>1 GB</span>
                  <span>4 GB</span>
                  <span>8 GB</span>
                  <span>16 GB</span>
                  <span>32 GB</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">CPU Allocation</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate CPU resources for your server</p>
              </div>
              <div className="card bg-slate-800/20 border-slate-700/30">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center gap-2">
                    <Cpu size={24} className="text-ryzen-400" />
                    <span className="text-4xl font-bold text-white">{cpu}</span>
                    <span className="text-lg text-slate-400">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{cpu >= 100 ? `${cpu / 100} core${cpu >= 200 ? "s" : ""}` : "Less than 1 core"}</p>
                </div>
                <input type="range" min={50} max={400} step={50} value={cpu}
                  onChange={e => setCpu(Number(e.target.value))}
                  className="w-full accent-ryzen-500" />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>0.5 core</span>
                  <span>1 core</span>
                  <span>2 cores</span>
                  <span>3 cores</span>
                  <span>4 cores</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Disk Allocation</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate storage space for your server</p>
              </div>
              <div className="card bg-slate-800/20 border-slate-700/30">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center gap-2">
                    <HardDrive size={24} className="text-ryzen-400" />
                    <span className="text-4xl font-bold text-white">{disk >= 1024 ? (disk / 1024).toFixed(0) : disk}</span>
                    <span className="text-lg text-slate-400">{disk >= 1024 ? "GB" : "MB"}</span>
                  </div>
                </div>
                <input type="range" min={1024} max={102400} step={1024} value={disk}
                  onChange={e => setDisk(Number(e.target.value))}
                  className="w-full accent-ryzen-500" />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>1 GB</span>
                  <span>10 GB</span>
                  <span>25 GB</span>
                  <span>50 GB</span>
                  <span>100 GB</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400">Backups</label>
                  <select value={backups} onChange={e => setBackups(Number(e.target.value))} className="input-field mt-1.5">
                    {[0, 1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">Databases</label>
                  <select value={databases} onChange={e => setDatabases(Number(e.target.value))} className="input-field mt-1.5">
                    {[0, 1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ryzen-500/10">
                  <Rocket size={32} className="text-ryzen-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Ready to Deploy</h2>
                <p className="text-sm text-slate-400 mt-2">Review your configuration before deploying</p>
              </div>

              <div className="space-y-2">
                {[
                  ["Server Name", name],
                  ["Software", selectedSoftware?.name || software],
                  ["Version", `Minecraft ${version}`],
                  ["Node", nodes.find(n => n.id === nodeId)?.name || nodeId],
                  ["RAM", `${ram >= 1024 ? `${(ram / 1024).toFixed(0)} GB` : `${ram} MB`}`],
                  ["CPU", `${cpu}% ${cpu >= 100 ? `(${cpu / 100} core${cpu >= 200 ? "s" : ""})` : ""}`],
                  ["Disk", `${disk >= 1024 ? `${(disk / 1024).toFixed(0)} GB` : `${disk} MB`}`],
                  ["Backups", String(backups)],
                  ["Databases", String(databases)],
                  ["Docker Image", dockerImages[software] || "auto"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <button onClick={handleDeploy} disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Deploying Server...
                  </span>
                ) : (
                  <><Rocket size={18} /> Deploy Server</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="text-xs text-slate-500">Step {step + 1} of {steps.length}</div>
        {step < 7 ? (
          <button onClick={() => setStep(Math.min(7, step + 1))} disabled={!canProceed()} className="btn-primary">
            Continue <ChevronRight size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}