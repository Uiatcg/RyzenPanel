import type { ReactNode } from "react";
import { JungleSidebar } from "@/src/components/JungleSidebar";
import { Navbar } from "@/src/components/Navbar";
import { BottomNav } from "@/src/components/BottomNav";
import { CommandPalette } from "@/src/components/CommandPalette";
import { AudioPlayer } from "@/src/components/AudioPlayer";
import { JungleParticles } from "@/src/components/JungleParticles";
import { auth } from "@/src/lib/auth-utils";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await auth();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <JungleSidebar isAdmin={user?.role === "ADMIN"} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
      <CommandPalette isAdmin={user?.role === "ADMIN"} />
      <AudioPlayer />
      <JungleParticles />
    </div>
  );
}
