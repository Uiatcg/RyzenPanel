import type { ReactNode } from "react";
import "./globals.css";
import { MinecraftBackground } from "@/src/components/MinecraftBackground";

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
        <MinecraftBackground />
        <div className="block-grid" />
        {children}
      </body>
    </html>
  );
}
