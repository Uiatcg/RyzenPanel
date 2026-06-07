import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "ZungleVibe Hosting — Premium Minecraft Server Hosting",
  description: "ZungleVibe Hosting — Premium Minecraft server hosting in the heart of the jungle. Deploy, manage, and scale your servers.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen text-[#F5F7F5] antialiased">
        <div className="jungle-bg" />
        <div className="fog-layer" />
        {children}
      </body>
    </html>
  );
}
