import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "RYZENPANEL — Minecraft Server Hosting",
  description: "RYZENPANEL — Premium Minecraft server hosting control panel",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen text-slate-100 antialiased">
        <div className="ryzen-bg" />
        <div className="block-grid" />
        {children}
        <footer className="fixed bottom-0 left-0 right-0 z-50 text-center py-1.5 text-[10px] text-slate-600 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/30 select-none">
          <span className="font-semibold text-ryzen-400">RYZENPANEL</span>
          <span className="mx-1.5 opacity-50">•</span>
          Made with ❤️ by RtxRyzen / RtxRyzenx3D
        </footer>
      </body>
    </html>
  );
}
