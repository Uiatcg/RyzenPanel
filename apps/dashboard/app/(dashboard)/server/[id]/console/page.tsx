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
      }
    });
  }, [params.id]);

  useEffect(() => {
    if (autoScroll) logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, autoScroll]);

  useEffect(() => {
    if (!nodeIp) return;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let reconnectAttempts = 0;
    const MAX_RECONNECT = 10;

    function connect() {
      if (reconnectAttempts >= MAX_RECONNECT) {
        setLogs(prev => [...prev, "[ERROR] [RYZENPANEL] Max reconnection attempts reached. Refresh page to try again."]);
        return;
      }
      reconnectAttempts++;

      let protocol = "ws:";
      let daemonHost = process.env.NEXT_PUBLIC_DAEMON_HOST || `${nodeIp}:8080`;
      if (nodeFqdn?.startsWith("https://")) {
        protocol = "wss:";
        daemonHost = nodeFqdn.replace(/^https?:\/\//, "");
      } else if (nodeFqdn?.startsWith("http://")) {
        daemonHost = nodeFqdn.replace(/^https?:\/\//, "");
      }
      const token = process.env.NEXT_PUBLIC_DAEMON_KEY || nodeDaemonKey || "daemon";
      const wsContainerId = containerId || params.id;
      const wsUrl = `${protocol}//${daemonHost}/ws/console?token=${token}&containerId=${wsContainerId}`;

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
            setLogs(prev => [...prev, `[ERROR] ${msg.error}`]);
            // Don't reconnect on "no such container" - permanent error
            if (msg.error.includes("no such container") || msg.error.includes("No such container")) {
              setLogs(prev => [...prev, "[WARN] [RYZENPANEL] Container not found. Waiting for server to start..."]);
              reconnectAttempts = MAX_RECONNECT; // Stop retrying
              return;
            }
          }
        } catch {
          setLogs(prev => [...prev, event.data]);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (reconnectAttempts < MAX_RECONNECT) {
          setLogs(prev => [...prev, "[WARN] [RYZENPANEL] Disconnected from daemon. Reconnecting..."]);
          reconnectTimer = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [params.id, nodeIp, nodeFqdn, nodeDaemonKey, containerId]);

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

  function handleCopyAll() {
    navigator.clipboard.writeText(logs.join("\n"));
  }

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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
            <Terminal size={16} className="text-ryzen-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Live Console</h3>
              <span className={`text-xs font-medium ${connected ? "text-ryzen-400" : "text-red-400"}`}>
                {connected ? <Wifi size={12} className="inline mr-1" /> : <WifiOff size={12} className="inline mr-1" />}
                {connected ? "Connected" : "Disconnected"}
              </span>
              <span className={`text-xs font-medium ${statusColors[serverStatus] || "text-slate-400"}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${
                  serverStatus === "ONLINE" ? "bg-ryzen-400" : serverStatus === "OFFLINE" ? "bg-red-400" : "bg-yellow-400"
                }`} />
                {serverStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Send commands and view live output</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => handlePowerAction("start")} disabled={powerLoading !== null}
            className="flex items-center gap-1 rounded-lg bg-ryzen-500/10 px-2.5 py-1.5 text-xs font-medium text-ryzen-400 hover:bg-ryzen-500/20 transition-all disabled:opacity-50">
            <Play size={12} /> Start
          </button>
          <button onClick={() => handlePowerAction("stop")} disabled={powerLoading !== null}
            className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
            <Square size={12} /> Stop
          </button>
          <button onClick={() => handlePowerAction("restart")} disabled={powerLoading !== null}
            className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2.5 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/20 transition-all disabled:opacity-50">
            <RotateCcw size={12} /> Restart
          </button>
          <button onClick={() => handlePowerAction("kill")} disabled={powerLoading !== null}
            className="flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
            <Zap size={12} /> Kill
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 py-2 text-xs" placeholder="Search console output..." />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-2">
          <span className="text-[10px] text-slate-500">{filteredLogs.length} lines</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setLogs([])} className="btn-ghost text-[10px] px-2 py-1"><Trash2 size={12} /> Clear</button>
            <button onClick={handleCopyAll} className="btn-ghost text-[10px] px-2 py-1"><Copy size={12} /> Copy All</button>
            <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-ryzen-500 focus:ring-ryzen-500/20 w-3 h-3" />
              Auto-scroll
            </label>
          </div>
        </div>
        <div className="font-mono text-xs leading-relaxed" style={{ maxHeight: "50vh", overflowY: "auto", padding: "12px" }}>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Terminal size={32} className="text-slate-700 mb-3" />
              <p className="text-xs text-slate-500">No console output yet</p>
            </div>
          ) : (
            filteredLogs.map((line, i) => (
              <div key={i} className="py-0.5 hover:bg-slate-800/20 px-2 -mx-2 rounded">
                <span dangerouslySetInnerHTML={{ __html: formatLogLine(line) }} />
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          className="input-field flex-1 font-mono text-sm" placeholder="Type a command..."
          disabled={!connected}
        />
        <button onClick={handleSend} disabled={!connected || !input.trim()} className="btn-primary px-4">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}