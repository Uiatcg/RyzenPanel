"use client";

import Link from "next/link";

export function JungleFooter() {
  return (
    <footer className="relative border-t border-[rgba(61,220,132,0.08)] bg-[rgba(11,15,12,0.9)] backdrop-blur-xl">
      {/* Vine decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[rgba(61,220,132,0.3)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img src="/zungle-logo.svg" alt="ZungleVibe" className="h-10 w-10 rounded-xl" />
              <div>
                <div className="text-lg font-bold gradient-text">ZungleVibe</div>
                <div className="text-[9px] font-semibold gradient-text-gold tracking-[0.2em] uppercase">Hosting</div>
              </div>
            </Link>
            <p className="text-sm text-[rgba(245,247,245,0.4)] leading-relaxed">
              Premium Minecraft hosting deep in the jungle. Unleash the wild power of our servers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-[#3DDC84] mb-4 uppercase tracking-wider">Hosting</h4>
            <ul className="space-y-2">
              {["Minecraft Servers", "Modpack Servers", "BungeeCord", "Velocity Proxy"].map(l => (
                <li key={l}><Link href="/create-server" className="text-sm text-[rgba(245,247,245,0.5)] hover:text-[#3DDC84] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#3DDC84] mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Blog", "Careers", "Status Page"].map(l => (
                <li key={l}><Link href="/" className="text-sm text-[rgba(245,247,245,0.5)] hover:text-[#3DDC84] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#3DDC84] mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              {["Documentation", "Knowledge Base", "Discord Community", "Contact Us"].map(l => (
                <li key={l}><Link href="/tickets" className="text-sm text-[rgba(245,247,245,0.5)] hover:text-[#3DDC84] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[rgba(61,220,132,0.08)]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-[rgba(245,247,245,0.3)]">
              <span className="font-semibold gradient-text">ZungleVibe</span> &copy; {new Date().getFullYear()}. Built for the wild.
            </p>
            <p className="text-[10px] text-[rgba(245,247,245,0.2)]">
              🌿 Powered by nature, engineered for performance
            </p>
          </div>
        </div>
      </div>

      {/* Permanent RYZENPANEL footer */}
      <div className="text-center py-1.5 text-[10px] text-[rgba(245,247,245,0.2)] bg-[rgba(6,10,7,0.8)] border-t border-[rgba(61,220,132,0.05)] select-none">
        <span className="font-semibold text-[#3DDC84]">RYZENPANEL</span>
        <span className="mx-1.5 opacity-50">&bull;</span>
        Made with ❤️ by RtxRyzen / RtxRyzenx3D
      </div>
    </footer>
  );
}
