import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <img src="/logo.svg" alt="RYZENPANEL" className="h-10 w-10 rounded-xl" />
        <div>
          <div className="text-lg font-bold text-white">RYZENPANEL</div>
          <div className="text-xs text-ryzen-400">Next Generation Minecraft Hosting</div>
        </div>
      </Link>
      {children}
    </div>
  );
}
