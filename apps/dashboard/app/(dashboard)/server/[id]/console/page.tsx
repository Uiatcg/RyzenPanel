"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Terminal, Send, Trash2, Copy, Search, Play, Square, RotateCcw, Zap, Wifi, WifiOff } from "lucide-react";

export default function ConsolePage() {
  const params = useParams();
  const [logs, setLogs] = useState<string[]>(["[INFO] [RYZENPANEL] Console initialized. Connecting to daemon..."]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [connected, setConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>("OFFLINE");
  const [powerLoading, setPowerLoading] = useState<string | null>(null);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [nodeIp, setNodeIp] = useState<string | null>(null);
  const [nodeFqdn, setNodeFqdn] = useState<string | null>(null);
  const [nodeDaemonKey, setNodeDaemonKey] = useState<string | null>(null);
  const [nodeDaemonPort, setNodeDaemonPort] = useState<number>(8080);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/servers/${params.id}`).then(r => r.json()).then(d => {
      if (d) {
        setServerStatus(d.status);
        if (d.containerId) setContainerId(d.containerId);
        if (d.node?.ip) setNodeIp(d.node.ip);
        if (d.node?.fqdn) setNodeFqdn(d.node.fqdn);
        if (d.node?.daemonKey) setNodeDaemonKey(d.node.daemonKey);
        if (d.node?.daemonPort) setNodeDaemonPort(d.node.daemonPort);
      }
    });
  }, [params.id]);

  useEffect(() => {
    if (autoScroll) logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, autoScroll]);

  useEffect(() => {
    if (!nodeIp && !nodeFqdn) return;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let reconnectAttempts = 0;
    const MAX_RECONNECT = 10;

    function buildWsUrl(): string {
      let protocol = "ws:";
      let host: string;

      if (nodeFqdn?.startsWith("https://")) {
        protocol = "wss:";
        host = nodeFqdn.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      } else if (nodeFqdn?.startsWith("http://")) {
        host = nodeFqdn.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      } else if (nodeFqdn) {
        host = nodeFqdn.replace(/\/+$/, "");
      } else {
        host = `${nodeIp}:${nodeDaemonPort || 8080}`;
      }
      const token = nodeDaemonKey || "daemon";
      const wsContainerId = containerId;
      if (!wsContainerId) return "";
      return `${protocol}//${host}/ws/console?token=${token}&containerId=${wsContainerId}`;
    }

    function connect() {
      if (reconnectAttempts >= MAX_RECONNECT) {
        setLogs(prev => [...prev, "[ERROR] [RYZENPANEL] Max reconnection attempts reached. Refresh page to try again."]);
        return;
      }
      reconnectAttempts++;
      const wsUrl = buildWsUrl();
      if (!wsUrl) {
        setLogs(prev => [...prev, "[INFO] [RYZENPANEL] Server has no container yet. Start the server to access console."]);
        return;
      }
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        reconnectAttempts = 0;
        setConnected(true);
        setLogs(prev => [...prev, "[INFO] [RYZENPANEL] Connected to daemon."]);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "output") {
            setLogs(prev => [...prev, msg.data]);
          } else if (msg.error) {
            if (msg.error.includes("no such container") || msg.error.includes("No such container") || msg.error.includes("NotFound")) {
              setLogs(prev => [...prev, "[INFO] [RYZENPANEL] Container not found. Waiting for server to start..."]);
              return;
            }
            setLogs(prev => [...prev, `[ERROR] ${msg.error}`]);
          }
        } catch {
          setLogs(prev => [...prev, event.data]);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (reconnectAttempts < MAX_RECONNECT) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => { ws.close(); };
      wsRef.current = ws;
    }

    connect();
    return () => { clearTimeout(reconnectTimer); wsRef.current?.close(); };
  }, [params.id, nodeIp, nodeFqdn, nodeDaemonKey, nodeDaemonPort, containerId]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "input", data: input + "\n" }));
    setLogs(prev => [...prev, `> ${input}`]);
    setInput("");
  }, [input]);

  async function handlePowerAction(action: string) {
    setPowerLoading(action);
    try {
      const statusRes = await fetch(`/api/servers/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (statusRes.ok) {
        const statusMap: Record<string, string> = { start: "STARTING", stop: "STOPPING", restart: "RESTARTING", kill: "OFFLINE" };
        setServerStatus(statusMap[action] || "OFFLINE");
        setLogs(prev => [...prev, `[INFO] [RYZENPANEL] Server ${action} command issued.`]);
        const realContainerId = containerId || params.id;
        if (nodeDaemonKey && realContainerId) {
          const daemonBase = nodeFqdn?.startsWith("http") ? nodeFqdn : `http://${nodeIp}:8080`;
          fetch(`${daemonBase}/api/containers/${realContainerId}/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-daemon-key": nodeDaemonKey },
          }).catch(() => {});
        }
      }
    } catch { }
    setPowerLoading(null);
  }

  function handleCopyAll() { navigator.clipboard.writeText(logs.join("\n")); }

  const filteredLogs = search ? logs.filter(l => l.toLowerCase().includes(search.toLowerCase())) : logs;

  function formatLogLine(text: string) {
    const colors: Record<string, string> = {
      "0": "#000", "1": "#00a", "2": "#0a0", "3": "#0aa", "4": "#a00",
      "5": "#a0a", "6": "#a60", "7": "#aaa", "8": "#555", "9": "#55f",
      a: "#5f5", b: "#5ff", c: "#f55", d: "#f5f", e: "#ff5", f: "#fff",
    };
    const formatted = text.replace(/\§([0-9a-fklmnor])/g, (_, c) => {
      if (c === "r") return "</span>";
      if (colors[c]) return `<span style="color:${colors[c]}">`;
      return "";
    });
    return formatted;
  }

  const statusColors: Record<string, string> = {
    ONLINE: "text-ryzen-400", OFFLINE: "text-red-400", STARTING: "text-yellow-400",
    STOPPING: "text-yellow-400", RESTARTING: "text-yellow-400", SUSPENDED: "text-red-400",
    INSTALLING: "text-blue-400", INSTALL_FAILED: "text-red-400",
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/30">
            <Terminal size={18} className="text-ryzen-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Live Console</h3>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                connected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`} />
                {connected ? "Connected" : "Disconnected"}
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                serverStatus === "ONLINE" ? "bg-ryzen-500/10 text-ryzen-400 border-ryzen-500/20" :
                serverStatus === "OFFLINE" ? "bg-slate-800/50 text-slate-500 border-slate-700/30" :
                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  serverStatus === "ONLINE" ? "bg-ryzen-400" :
                  serverStatus === "OFFLINE" ? "bg-slate-600" : "bg-yellow-400"
                }`} />
                {serverStatus}
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Send commands and view live output</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[
            { action: "start", icon: Play, label: "Start", color: "text-ryzen-400 hover:bg-ryzen-500/20 bg-ryzen-500/10 border-ryzen-500/20" },
            { action: "stop", icon: Square, label: "Stop", color: "text-red-400 hover:bg-red-500/20 bg-red-500/10 border-red-500/20" },
            { action: "restart", icon: RotateCcw, label: "Restart", color: "text-yellow-400 hover:bg-yellow-500/20 bg-yellow-500/10 border-yellow-500/20" },
            { action: "kill", icon: Zap, label: "Kill", color: "text-red-400 hover:bg-red-500/30 bg-red-500/20 border-red-500/30" },
          ].map(({ action, icon: Icon, label, color }) => (
            <button key={action} onClick={() => handlePowerAction(action)} disabled={powerLoading !== null}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${color}`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 py-2 text-xs bg-slate-900/60 border-slate-700/30 focus:border-ryzen-500/30"
          placeholder="🔍 Search console output..." />
      </div>

      {/* Terminal */}
      <div className="rounded-2xl border border-slate-700/30 overflow-hidden bg-black/70 backdrop-blur-sm shadow-lg">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-2 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <span className="text-[10px] text-slate-600 ml-2 font-mono">
              ⚡ ryzenpanel@console — {filteredLogs.length} lines
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-all">
              <Trash2 size={12} className="inline mr-1" />Clear
            </button>
            <button onClick={handleCopyAll}
              className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-all">
              <Copy size={12} className="inline mr-1" />Copy
            </button>
            <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer select-none">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-ryzen-500 focus:ring-ryzen-500/20 w-3 h-3" />
              Auto-scroll
            </label>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="font-mono text-xs leading-relaxed bg-[#0a0a12]/90" style={{ maxHeight: "55vh", overflowY: "auto", padding: "14px" }}>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Terminal size={36} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No console output yet</p>
              <p className="text-[10px] text-slate-600 mt-1">Start the server to see logs</p>
            </div>
          ) : (
            filteredLogs.map((line, i) => (
              <div key={i} className="py-[2px] hover:bg-white/[0.02] px-2 -mx-2 rounded text-[#c0c0c0] whitespace-pre-wrap break-all">
                <span className="text-[#444] select-none mr-2 font-mono" style={{ minWidth: "32px", display: "inline-block", textAlign: "right" }}>
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatLogLine(line) }} />
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Command Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ryzen-400 font-mono font-bold">$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            className="input-field flex-1 font-mono text-sm pl-8 bg-black/40 border-slate-700/30 focus:border-ryzen-500/30"
            placeholder={connected ? "Type a command..." : "⏳ Waiting for connection..."}
            disabled={!connected}
          />
        </div>
        <button onClick={handleSend} disabled={!connected || !input.trim()}
          className="flex items-center gap-2 rounded-xl bg-ryzen-500/10 border border-ryzen-500/20 px-5 text-sm font-medium text-ryzen-400 hover:bg-ryzen-500/20 transition-all disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
