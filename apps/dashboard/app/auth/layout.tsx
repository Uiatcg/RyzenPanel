import type { ReactNode } from "react";
import { Zap, Pickaxe } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="relative mb-10 flex flex-col items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-ryzen-500/20 to-red-600/20 border-2 border-ryzen-500/30 ryzen-glow animate-float">
          <Zap size={36} className="text-ryzen-400" />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold tracking-wide text-white" style={{ fontFamily: "'Inter', sans-serif", textShadow: "0 0 30px rgba(239,68,68,0.3)" }}>
            RYZENPANEL
          </div>
          <div className="mc-gradient-text text-xs font-semibold tracking-[0.2em] uppercase mt-1">
            Minecraft Server Hosting
          </div>
        </div>
      </div>
      {children}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-[10px] text-slate-700 font-mono">
          ⛏️ RYZENPANEL v2.0 — Empowering your Minecraft experience
        </p>
      </div>
    </div>
  );
}
