import type { ReactNode } from "react";
import { JungleParticles } from "@/src/components/JungleParticles";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <JungleParticles />
      {children}
    </div>
  );
}
