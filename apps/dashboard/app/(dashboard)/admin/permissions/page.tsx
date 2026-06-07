"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, ShieldCheck, ShieldX, Save, Check, Plus,
  X, Users, Server, HardDrive, Globe, Ticket, MessageSquare,
  Database, CreditCard, Megaphone, Palette, ToggleLeft, Coins,
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  MODERATOR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const ICON_MAP: Record<string, any> = {
  manage_users: Users, manage_servers: Server, manage_nodes: HardDrive,
  manage_allocations: Globe, manage_tickets: Ticket, manage_announcements: Megaphone,
  manage_settings: Palette, manage_toggles: ToggleLeft, manage_credits: Coins,
  manage_roles: Shield, view_activity: MessageSquare, manage_invoices: CreditCard,
  manage_backups: Database,
};

export default function AdminPermissionsPage() {
  const [roles, setRoles] = useState<Record<string, any[]>>({});
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPerm, setNewPerm] = useState({ key: "", name: "", description: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/permissions").then(r => r.json()),
      fetch("/api/admin/roles").then(r => r.json()),
    ]).then(([permData, roleData]) => {
      setPermissions(permData.permissions || []);
      setRoles(roleData.roles || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function togglePermission(rpId: string, current: boolean) {
    setSaving(rpId);
    const res = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rolePermissionId: rpId, allowed: !current }),
    });
    if (res.ok) {
      const data = await res.json();
      setRoles(prev => {
        const updated = { ...prev };
        for (const role of Object.keys(updated)) {
          updated[role] = updated[role].map(rp =>
            rp.id === rpId ? { ...rp, allowed: data.rolePermission.allowed } : rp
          );
        }
        return updated;
      });
    }
    setSaving(null);
  }

  async function createPermission() {
    if (!newPerm.key || !newPerm.name) return;
    const res = await fetch("/api/admin/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPerm),
    });
    if (res.ok) {
      setCreating(false);
      setNewPerm({ key: "", name: "", description: "" });
      const permData = await fetch("/api/admin/permissions").then(r => r.json());
      const roleData = await fetch("/api/admin/roles").then(r => r.json());
      setPermissions(permData.permissions || []);
      setRoles(roleData.roles || {});
    }
  }

  if (loading) return <div className="p-6"><div className="skeleton h-96" /></div>;

  const roleOrder = ["ADMIN", "MODERATOR", "USER"];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-600/20 border-2 border-violet-500/30 ryzen-glow-sm">
              <Shield size={30} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
              <p className="text-sm text-slate-400 mt-1">Manage rank-based permissions</p>
            </div>
          </div>
          <button onClick={() => setCreating(!creating)}
            className="btn-primary-alt text-sm"
          >
            <Plus size={14} /> New Permission
          </button>
        </div>
      </motion.div>

      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-white">Create Permission</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-slate-400">Key</label>
              <input value={newPerm.key} onChange={e => setNewPerm({ ...newPerm, key: e.target.value })}
                className="input-field mt-1" placeholder="manage_something" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Name</label>
              <input value={newPerm.name} onChange={e => setNewPerm({ ...newPerm, name: e.target.value })}
                className="input-field mt-1" placeholder="Manage Something" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Description</label>
              <input value={newPerm.description} onChange={e => setNewPerm({ ...newPerm, description: e.target.value })}
                className="input-field mt-1" placeholder="Allows user to..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createPermission} className="btn-primary text-sm">
              <Check size={14} /> Create
            </button>
            <button onClick={() => setCreating(false)} className="btn-ghost text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[600px] space-y-4">
          {/* Header */}
          <div className="grid grid-cols-[2fr_repeat(3,1fr)] gap-4 px-4 py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Permission</span>
            {roleOrder.map(role => (
              <span key={role} className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                {role}
              </span>
            ))}
          </div>

          {permissions.length === 0 ? (
            <div className="text-center py-16">
              <Shield size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No permissions defined yet</p>
            </div>
          ) : (
            permissions.map((perm: any, idx: number) => {
              const Icon = ICON_MAP[perm.key] || Shield;
              return (
                <motion.div
                  key={perm.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="grid grid-cols-[2fr_repeat(3,1fr)] gap-4 items-center rounded-xl bg-slate-800/20 px-4 py-3.5 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Icon size={14} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{perm.name}</p>
                      <p className="text-[10px] text-slate-500">{perm.key}{perm.description ? ` — ${perm.description}` : ""}</p>
                    </div>
                  </div>

                  {roleOrder.map(role => {
                    const rp = (roles[role] || []).find((r: any) => r.permissionId === perm.id);
                    if (!rp) return <div key={role} className="flex justify-center" />;
                    const isSaving = saving === rp.id;
                    return (
                      <div key={role} className="flex justify-center">
                        <button
                          onClick={() => togglePermission(rp.id, rp.allowed)}
                          disabled={isSaving}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            rp.allowed
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-700/20 text-slate-500 border-slate-700/30 hover:bg-slate-700/30"
                          }`}
                        >
                          {isSaving ? (
                            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : rp.allowed ? (
                            <ShieldCheck size={12} />
                          ) : (
                            <ShieldX size={12} />
                          )}
                          {rp.allowed ? "Allowed" : "Denied"}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Users by Role */}
      {roleOrder.filter(r => (roles[r] || []).length > 0).map(role => (
        <motion.div key={role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${ROLE_COLORS[role]}`}>
              <Shield size={12} />
              {role}
            </span>
            <span className="text-xs text-slate-500">{(roles[role] || []).length} permissions</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
