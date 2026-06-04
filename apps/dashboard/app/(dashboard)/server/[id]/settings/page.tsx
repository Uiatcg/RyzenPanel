"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sliders, Save, Trash2, AlertTriangle, RefreshCw, Copy, ArrowUpRight, Ban, CheckCircle,
  UserPlus,
} from "lucide-react";

export default function ServerSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [server, setServer] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: string; text: string } | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");

  useEffect(() => {
    fetch(`/api/servers/${params.id}`).then(r => r.json()).then(d => {
      setServer(d); setName(d.name); setDescription(d.description || "");
    });
  }, [params.id]);

  async function handleSave() {
    const res = await fetch(`/api/servers/${params.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleAction(action: string, endpoint?: string) {
    setActionLoading(action);
    setActionMsg(null);
    const url = endpoint || `/api/servers/${params.id}/${action}`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });
    setActionLoading(null);
    if (res.ok) {
      setActionMsg({ type: "success", text: `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully` });
      setTimeout(() => setActionMsg(null), 3000);
    } else {
      const d = await res.json();
      setActionMsg({ type: "error", text: d.message || `${action} failed` });
    }
  }

  async function handleTransferOwnership() {
    if (!transferEmail.trim()) return;
    setActionLoading("transfer-owner");
    setActionMsg(null);
    const res = await fetch("/api/users/me", { method: "POST" });
    const usersRes = await fetch(`/api/admin/users?email=${encodeURIComponent(transferEmail)}`);
    const usersData = await usersRes.json();
    const targetUser = usersData?.users?.find((u: any) => u.email === transferEmail);
    if (!targetUser) {
      setActionMsg({ type: "error", text: "User not found" });
      setActionLoading(null);
      return;
    }
    await handleAction("owner", `/api/servers/${params.id}/owner`);
    setActionLoading(null);
    setShowTransfer(false);
    setTransferEmail("");
  }

  async function handleDelete() {
    await fetch(`/api/servers/${params.id}`, { method: "DELETE" });
    router.push("/my-servers");
  }

  if (!server) return <div className="skeleton h-64" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Sliders size={18} className="text-ryzen-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Server Settings</h3>
            <p className="text-xs text-slate-500">Manage server configuration</p>
          </div>
        </div>

        {actionMsg && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${actionMsg.type === "success" ? "bg-ryzen-500/10 text-ryzen-400 border border-ryzen-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {actionMsg.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400">Server Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field mt-1.5" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field mt-1.5 h-20" placeholder="Optional server description" />
          </div>
          <button onClick={handleSave} className="btn-primary">
            <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Server Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => handleAction("reinstall")} disabled={actionLoading === "reinstall"}
            className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm font-medium text-yellow-400 hover:bg-yellow-500/10 transition-all disabled:opacity-50">
            <RefreshCw size={16} className={actionLoading === "reinstall" ? "animate-spin" : ""} /> Reinstall Server
          </button>
          <button onClick={() => handleAction("clone")} disabled={actionLoading === "clone"}
            className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50">
            <Copy size={16} /> Clone Server
          </button>
          {!server.suspended ? (
            <button onClick={() => handleAction("suspend")} disabled={actionLoading === "suspend"}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
              <Ban size={16} /> Suspend Server
            </button>
          ) : (
            <button onClick={() => handleAction("unsuspend")} disabled={actionLoading === "unsuspend"}
              className="flex items-center gap-2 rounded-xl border border-ryzen-500/20 bg-ryzen-500/5 px-4 py-3 text-sm font-medium text-ryzen-400 hover:bg-ryzen-500/10 transition-all disabled:opacity-50">
              <CheckCircle size={16} /> Unsuspend Server
            </button>
          )}
          <button onClick={() => handleAction("transfer", `/api/servers/${params.id}/transfer`)} disabled={actionLoading === "transfer"}
            className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm font-medium text-violet-400 hover:bg-violet-500/10 transition-all disabled:opacity-50">
            <ArrowUpRight size={16} /> Transfer Node
          </button>
          <button onClick={() => setShowTransfer(!showTransfer)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-all">
            <UserPlus size={16} /> Transfer Ownership
          </button>
        </div>

        {showTransfer && (
          <div className="mt-4 space-y-3 p-4 rounded-xl bg-slate-800/20 border border-slate-700/30">
            <p className="text-xs text-slate-400">Enter the email of the user to transfer ownership to</p>
            <div className="flex gap-2">
              <input value={transferEmail} onChange={e => setTransferEmail(e.target.value)}
                className="input-field flex-1 text-sm" placeholder="user@example.com" type="email" />
              <button onClick={handleTransferOwnership} disabled={actionLoading === "transfer-owner" || !transferEmail.trim()}
                className="btn-primary text-xs px-3">Transfer</button>
            </div>
          </div>
        )}
      </div>

      <div className="card border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle size={18} className="text-red-400" /></div>
          <div>
            <h3 className="text-sm font-semibold text-white">Danger Zone</h3>
            <p className="text-xs text-slate-500">Irreversible actions - proceed with caution</p>
          </div>
        </div>
        {showDelete ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 font-medium">This will permanently delete <span className="text-white">{server.name}</span> and all its data. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-all"><Trash2 size={14} className="inline mr-1.5" /> Yes, Delete Permanently</button>
              <button onClick={() => setShowDelete(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDelete(true)} className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={14} className="inline mr-1.5" /> Delete Server
          </button>
        )}
      </div>
    </div>
  );
}