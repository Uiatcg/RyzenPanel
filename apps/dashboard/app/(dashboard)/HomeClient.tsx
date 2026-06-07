"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Server, Shield, Zap, Globe, Cpu, HardDrive, MemoryStick,
  ArrowRight, Plus, ChevronDown, Check, X, Star, MessageSquare,
  Wifi, Clock, Users, Sparkles, Crown, Heart, MapPin,
  Diamond, Sword, Pickaxe, TreePine, Leaf, Bug,
  Flame, Droplets, Wind, Mountain,
} from "lucide-react";
import { JungleVideoBackground } from "@/src/components/JungleVideoBackground";

const c = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const it = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } } };

const plans = [
  { name: "Sprout", price: "Free", period: "", ram: "1 GB", cpu: "100%", disk: "5 GB", features: ["Basic DDoS Protection", "Community Support", "1 Server"], popular: false, color: "emerald" },
  { name: "Sapling", price: "$4.99", period: "/mo", ram: "4 GB", cpu: "200%", disk: "20 GB", features: ["Advanced DDoS Protection", "Priority Support", "5 Backups", "Custom Domain"], popular: false, color: "emerald" },
  { name: "Ancient Oak", price: "$14.99", period: "/mo", ram: "16 GB", cpu: "400%", disk: "50 GB", features: ["Enterprise DDoS Protection", "24/7 Priority Support", "Unlimited Backups", "Custom Domain", "Dedicated IP"], popular: true, color: "gold" },
  { name: "World Tree", price: "$49.99", period: "/mo", ram: "64 GB", cpu: "800%", disk: "200 GB", features: ["Everything in Ancient Oak", "Dedicated Resources", "White-glove Migration", "Custom Startup", "SLA Guarantee"], popular: false, color: "gold" },
];

const features = [
  { icon: Shield, title: "DDoS Protection", desc: "Enterprise-grade protection absorbing attacks up to 1Tbps. Your jungle fortress is impenetrable.", color: "from-[#3DDC84] to-[#1FA855]" },
  { icon: Zap, title: "Instant Deployment", desc: "Deploy your Minecraft server in under 30 seconds. One-click installation for all modpacks.", color: "from-[#D4A017] to-[#B8860B]" },
  { icon: Cpu, title: "Ryzen & Intel CPUs", desc: "Latest generation processors with high single-thread performance for max TPS.", color: "from-[#3DDC84] to-[#28A745]" },
  { icon: HardDrive, title: "NVMe SSD Storage", desc: "Blazing fast NVMe drives for instant world loading and zero lag chunk generation.", color: "from-[#3DDC84] to-[#1FA855]" },
  { icon: Globe, title: "Global Locations", desc: "Servers in 6 continents. Low latency no matter where your players are.", color: "from-[#D4A017] to-[#B8860B]" },
  { icon: Clock, title: "99.9% Uptime SLA", desc: "Our jungle infrastructure guarantees maximum uptime for your server.", color: "from-[#3DDC84] to-[#28A745]" },
];

const reviews = [
  { name: "xJungleKing", avatar: "JK", role: "Server Owner", rating: 5, text: "Best hosting I've ever used. My 50-player server runs at 20 TPS constant. The support team responds in minutes!", server: "MC-Hub" },
  { name: "EmeraldCraft", avatar: "EC", role: "Modpack Dev", rating: 5, text: "Migrated my entire modded server in 5 minutes. Zero downtime. The performance is unreal compared to my old host.", server: "EmeraldSMP" },
  { name: "WildMiner99", avatar: "WM", role: "Network Admin", rating: 5, text: "Running a 3-server BungeeCord network with zero issues. The DDoS protection actually works — got hit and nothing happened.", server: "WildNetwork" },
  { name: "TropicalMC", avatar: "TM", role: "Content Creator", rating: 4, text: "Switched from a big name host and never looked back. Better performance, better support, better price. Simple.", server: "TropicalSMP" },
];

const locations = [
  { city: "New York", country: "USA", flag: "🇺🇸", ping: "~15ms", servers: "500+" },
  { city: "London", country: "UK", flag: "🇬🇧", ping: "~20ms", servers: "350+" },
  { city: "Frankfurt", country: "Germany", flag: "🇩🇪", ping: "~18ms", servers: "400+" },
  { city: "Tokyo", country: "Japan", flag: "🇯🇵", ping: "~25ms", servers: "300+" },
  { city: "Sydney", country: "Australia", flag: "🇦🇺", ping: "~30ms", servers: "200+" },
  { city: "São Paulo", country: "Brazil", flag: "🇧🇷", ping: "~35ms", servers: "150+" },
];

const faqs = [
  { q: "How fast can I deploy a server?", a: "Under 30 seconds. Select your plan, pick your software, and your server is live instantly." },
  { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade anytime. We'll prorate the difference automatically." },
  { q: "Do you support modpacks?", a: "Yes! We support all major modpacks — CurseForge, Modrinth, FTB, and more. One-click installation." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and cryptocurrency." },
  { q: "Is there a money-back guarantee?", a: "Yes, 7-day money-back guarantee on all paid plans. No questions asked." },
  { q: "Can I migrate from another host?", a: "Yes! Our support team will migrate your server for free on any paid plan." },
];

const stats = [
  { value: "15,000+", label: "Servers Deployed", icon: Server },
  { value: "99.9%", label: "Uptime SLA", icon: Clock },
  { value: "50,000+", label: "Happy Users", icon: Users },
  { value: "6", label: "Global Locations", icon: Globe },
];

export function HomeClient({ user, overview, servers, activity, brandSettings }: any) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const panelName = brandSettings?.panelName || "ZungleVibe";

  return (
    <div className="min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <JungleVideoBackground
          videoUrl={brandSettings?.heroVideoUrl}
          imageUrl={brandSettings?.heroImageUrl}
          overlayOpacity={0.45}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="hero-glow bg-[#3DDC84] top-1/3 left-1/4" />
            <div className="hero-glow bg-[#D4A017] bottom-1/3 right-1/4" style={{ animationDelay: "3s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-6">
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(61,220,132,0.1)] border border-[rgba(61,220,132,0.2)]">
                <Leaf size={14} className="text-[#3DDC84] animate-sway" />
                <span className="text-xs font-medium text-[#3DDC84]">Premium Minecraft Hosting</span>
              </div>
            </motion.div>

            <motion.img
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src="/zungle-logo.svg" alt="ZungleVibe" className="w-32 h-32 md:w-40 md:h-40 mb-6 animate-float"
            />

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
            >
              <span className="gradient-text">{panelName}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              className="text-lg md:text-xl text-[rgba(245,247,245,0.6)] max-w-2xl mb-10"
            >
              The ultimate Minecraft server hosting experience. Deploy, manage, and scale your servers in the heart of the jungle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {user ? (
                <Link href="/create-server" className="btn-primary text-lg px-8 py-4">
                  <Zap size={20} /> Deploy Server
                </Link>
              ) : (
                <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
                  <Zap size={20} /> Get Started Free
                </Link>
              )}
              <a href="#plans" className="btn-secondary text-lg px-8 py-4">
                View Plans <ArrowRight size={18} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
              className="absolute bottom-8 scroll-indicator"
            >
              <ChevronDown size={28} className="text-[rgba(61,220,132,0.4)]" />
            </motion.div>
          </div>
        </JungleVideoBackground>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 -mt-20 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto">
          <motion.div variants={it} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="card-jungle text-center py-6 feature-card">
                <s.icon size={24} className="text-[#3DDC84] mx-auto mb-3" />
                <p className="text-3xl font-black text-[#F5F7F5] animate-counter-glow">{s.value}</p>
                <p className="text-xs text-[rgba(245,247,245,0.5)] mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6" id="features">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto">
          <motion.div variants={it} className="text-center mb-16">
            <h2 className="section-title">Why <span className="gradient-text">ZungleVibe</span>?</h2>
            <p className="section-subtitle">Our jungle infrastructure is built for one thing: absolute performance.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={it} className="card-jungle feature-card">
                <div className={`feature-icon inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} mb-4`}>
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F7F5] mb-2">{f.title}</h3>
                <p className="text-sm text-[rgba(245,247,245,0.5)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="plans" className="py-24 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto">
          <motion.div variants={it} className="text-center mb-16">
            <h2 className="section-title">Choose Your <span className="gradient-text-gold">Biome</span></h2>
            <p className="section-subtitle">From solo adventures to massive networks — we have the perfect plan.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} variants={it}
                className={`rounded-2xl p-6 transition-all duration-300 feature-card ${
                  plan.popular
                    ? "glass-gold border-[rgba(212,160,23,0.3)] scale-[1.02]"
                    : "card-jungle"
                }`}
              >
                {plan.popular && (
                  <div className="badge-gold mb-4">
                    <Crown size={12} /> Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#F5F7F5] mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-[#3DDC84]">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[rgba(245,247,245,0.4)]">{plan.period}</span>}
                </div>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-[rgba(245,247,245,0.6)]">
                    <MemoryStick size={14} className="text-[#3DDC84]" /> {plan.ram} RAM
                  </div>
                  <div className="flex items-center gap-2 text-[rgba(245,247,245,0.6)]">
                    <Cpu size={14} className="text-[#3DDC84]" /> {plan.cpu} CPU
                  </div>
                  <div className="flex items-center gap-2 text-[rgba(245,247,245,0.6)]">
                    <HardDrive size={14} className="text-[#3DDC84]" /> {plan.disk} Disk
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[rgba(245,247,245,0.5)]">
                      <Check size={12} className="text-[#3DDC84] flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {plan.popular ? (
                  <Link href="/create-server" className="btn-gold w-full text-center">Get Started</Link>
                ) : (
                  <Link href="/create-server" className="btn-primary w-full text-center">Get Started</Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-24 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto">
          <motion.div variants={it} className="text-center mb-16">
            <h2 className="section-title">From the <span className="gradient-text">Jungle</span></h2>
            <p className="section-subtitle">Hear from server owners who made the switch.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((r, i) => (
              <motion.div key={r.name} variants={it} className="card-jungle">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#3DDC84]/30 to-[#1FA855]/30 flex items-center justify-center text-sm font-bold text-[#3DDC84]">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F5]">{r.name}</p>
                    <p className="text-[10px] text-[rgba(245,247,245,0.4)]">{r.role} &bull; {r.server}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} size={12} className="text-[#D4A017] fill-[#D4A017]" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[rgba(245,247,245,0.6)] leading-relaxed">{r.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ LOCATIONS ═══ */}
      <section className="py-24 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto">
          <motion.div variants={it} className="text-center mb-16">
            <h2 className="section-title">Global <span className="gradient-text">Jungle Network</span></h2>
            <p className="section-subtitle">Servers across 6 continents for maximum performance.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(loc => (
              <motion.div key={loc.city} variants={it} className="card-jungle flex items-center gap-4">
                <span className="text-3xl">{loc.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#F5F7F5]">{loc.city}, {loc.country}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[rgba(245,247,245,0.4)] mt-1">
                    <span className="flex items-center gap-1"><Wifi size={10} className="text-[#3DDC84]" /> {loc.ping}</span>
                    <span className="flex items-center gap-1"><Server size={10} /> {loc.servers} servers</span>
                  </div>
                </div>
                <MapPin size={16} className="text-[rgba(245,247,245,0.2)]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-24 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl mx-auto">
          <motion.div variants={it} className="text-center mb-16">
            <h2 className="section-title">Frequently <span className="gradient-text">Asked</span></h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={it} className="card-jungle">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-semibold text-[#F5F7F5]">{faq.q}</span>
                  <ChevronDown size={16} className={`text-[#3DDC84] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-[rgba(245,247,245,0.5)] mt-3 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ DISCORD ═══ */}
      <section className="py-24 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
          <motion.div variants={it}>
            <div className="card-jungle p-12 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[rgba(61,220,132,0.08)] rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[rgba(212,160,23,0.05)] rounded-full blur-3xl" />
              <div className="relative">
                <MessageSquare size={48} className="text-[#3DDC84] mx-auto mb-6 animate-float" />
                <h2 className="text-3xl md:text-4xl font-black text-[#F5F7F5] mb-4">Join the <span className="gradient-text">Jungle</span></h2>
                <p className="text-[rgba(245,247,245,0.5)] mb-8 max-w-xl mx-auto">
                  Connect with 10,000+ server owners, get instant support, and stay updated on the latest features.
                </p>
                <a href="https://discord.gg/zanglevibe" target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                >
                  <MessageSquare size={20} /> Join Discord
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6">
        <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
          <motion.div variants={it}>
            <div className="glass-jungle rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[rgba(61,220,132,0.1)] rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-[#F5F7F5] mb-4">Ready to Enter the <span className="gradient-text">Jungle</span>?</h2>
                <p className="text-[rgba(245,247,245,0.5)] mb-8 max-w-xl mx-auto">
                  Deploy your Minecraft server in seconds. No credit card required for the free plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <Link href="/create-server" className="btn-primary text-lg px-8 py-4">
                      <Plus size={20} /> Create Server
                    </Link>
                  ) : (
                    <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
                      <Zap size={20} /> Get Started Free
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ DASHBOARD PREVIEW (logged-in users) ═══ */}
      {user && servers && servers.length > 0 && (
        <section className="py-16 px-6">
          <motion.div variants={c} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto">
            <motion.div variants={it} className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#F5F7F5]">Your Servers</h2>
              <Link href="/my-servers" className="btn-ghost">View All <ArrowRight size={14} /></Link>
            </motion.div>
            <div className="space-y-3">
              {servers.slice(0, 3).map((s: any) => (
                <Link key={s.id} href={`/server/${s.id}`}
                  className="card-jungle flex items-center justify-between feature-card"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                      s.status === "online" ? "bg-[rgba(61,220,132,0.2)] text-[#3DDC84]" : "bg-[rgba(245,247,245,0.05)] text-[rgba(245,247,245,0.3)]"
                    }`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F5F7F5]">{s.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[rgba(245,247,245,0.4)]">
                        <span className={`flex items-center gap-1 ${s.status === "online" ? "text-[#3DDC84]" : ""}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.status === "online" ? "bg-[#3DDC84]" : "bg-[rgba(245,247,245,0.2)]"}`} />
                          {s.status}
                        </span>
                        <span>&bull;</span><span>{s.node}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[rgba(245,247,245,0.2)]" />
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
