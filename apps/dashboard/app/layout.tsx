import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "RYZENPANEL - Next Generation Minecraft Hosting",
  description: "RYZENPANEL — Premium Minecraft server hosting control panel",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-ryzen-500/5 blur-[120px]" />
          <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/3 blur-[80px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
