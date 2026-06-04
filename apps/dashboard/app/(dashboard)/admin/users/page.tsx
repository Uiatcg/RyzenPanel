"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
  }, []);

  const filtered = users.filter((u: any) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Users</h2>
        <span className="text-xs text-slate-500">{users.length} total</span>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" placeholder="Search users..." />
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_100px_120px] gap-4 border-b border-slate-800/50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Username</span><span>Email</span><span>Role</span><span>Joined</span>
        </div>
        {filtered.map((u: any) => (
          <div key={u.id} className="grid grid-cols-[1fr_1fr_100px_120px] gap-4 px-4 py-3 text-sm hover:bg-slate-800/20">
            <span className="text-white font-medium">{u.username}</span>
            <span className="text-slate-400">{u.email}</span>
            <span className={`badge text-xs w-fit ${u.role === "ADMIN" ? "badge-green" : "badge-slate"}`}>{u.role}</span>
            <span className="text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
