"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Users, Megaphone, Send, Trash2, Search,
  Crown, Shield, Star, Sparkles,
} from "lucide-react";

type Tab = "chat" | "members" | "announcements";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; role: string };
}

interface Member {
  id: string;
  username: string;
  email: string;
  role: string;
  credits: number;
  createdAt: string;
  _count: { servers: number };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const ROLE_STYLES: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  ADMIN: { color: "text-red-400", bg: "bg-red-500/10", icon: Crown, label: "Admin" },
  MODERATOR: { color: "text-blue-400", bg: "bg-blue-500/10", icon: Shield, label: "Moderator" },
  USER: { color: "text-slate-400", bg: "bg-slate-500/10", icon: Star, label: "User" },
};

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("USER");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.json()).then(d => {
      if (d?.user) {
        setCurrentUserId(d.user.id);
        setCurrentUserRole(d.user.role);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    if (tab === "chat") {
      fetch("/api/community/messages")
        .then(r => r.json())
        .then(d => { setMessages(d.messages || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (tab === "members") {
      fetch("/api/community/members")
        .then(r => r.json())
        .then(d => { setMembers(d.members || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (tab === "announcements") {
      fetch("/api/community/announcements")
        .then(r => r.json())
        .then(d => { setAnnouncements(d.announcements || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredMembers = members.filter(m =>
    !search ||
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input;
    setInput("");
    try {
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
      } else {
        setInput(text);
      }
    } catch {
      setInput(text);
    }
    setSending(false);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/community/messages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  }

  const tabs = [
    { id: "chat" as Tab, label: "Live Chat", icon: MessageSquare },
    { id: "members" as Tab, label: "Members", icon: Users },
    { id: "announcements" as Tab, label: "Announcements", icon: Megaphone },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/30 p-8 ryzen-glow"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border-2 border-blue-500/30 ryzen-glow-sm animate-float">
            <Users size={30} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Community</h1>
            <p className="text-sm text-slate-400 mt-1">Chat with other players, view members and announcements</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:bg-slate-800/30 border border-transparent"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton h-96 rounded-2xl" />
      ) : tab === "chat" ? (
        <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 overflow-hidden flex flex-col h-[600px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare size={40} className="text-slate-700 mb-3" />
                <p className="text-sm text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-600 mt-1">Be the first to say hello!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.user.id === currentUserId;
                const canDelete = isOwn || currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";
                const role = ROLE_STYLES[msg.user.role] || ROLE_STYLES.USER;
                const Icon = role.icon;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-ryzen-500/30 to-blue-600/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {msg.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex-1 max-w-[75%] ${isOwn ? "flex flex-col items-end" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">{msg.user.username}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium ${role.bg} ${role.color}`}>
                          <Icon size={9} />
                          {role.label}
                        </span>
                        <span className="text-[10px] text-slate-600">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 ${isOwn ? "bg-ryzen-500/15 border border-ryzen-500/20" : "bg-slate-800/50 border border-slate-700/30"}`}>
                        <p className="text-sm text-slate-200 break-words">{msg.content}</p>
                      </div>
                    </div>
                    {canDelete && (
                      <button onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
          <div className="border-t border-slate-800/50 p-4">
            <div className="flex items-end gap-2">
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                rows={2} maxLength={500}
                className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
              />
              <button onClick={sendMessage} disabled={sending || !input.trim()}
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-center hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">{input.length}/500</p>
          </div>
        </div>
      ) : tab === "members" ? (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search members by username or email..."
              className="input-field pl-10" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No members found</p>
              </div>
            ) : (
              filteredMembers.map(m => {
                const role = ROLE_STYLES[m.role] || ROLE_STYLES.USER;
                const Icon = role.icon;
                return (
                  <div key={m.id} className="rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-4 feature-card">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-ryzen-500/30 to-blue-600/30 flex items-center justify-center text-base font-bold text-white">
                        {m.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{m.username}</p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium ${role.bg} ${role.color}`}>
                          <Icon size={9} />
                          {role.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Joined {new Date(m.createdAt).toLocaleDateString()}</span>
                      <span>{m._count.servers} servers</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400">
                      <Sparkles size={10} />
                      <span className="font-mono">{m.credits.toLocaleString()} credits</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : tab === "announcements" ? (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No announcements yet</p>
            </div>
          ) : (
            announcements.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-violet-500/5 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone size={14} className="text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                  <span className="text-[10px] text-slate-600 ml-auto">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{a.content}</p>
              </motion.div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
