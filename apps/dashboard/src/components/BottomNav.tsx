"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Server, PlusCircle, ShoppingCart, Ticket } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/my-servers", label: "Servers", icon: Server },
  { href: "/create-server", label: "Create", icon: PlusCircle },
  { href: "/billing", label: "Billing", icon: ShoppingCart },
  { href: "/tickets", label: "Support", icon: Ticket },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all ${
                isActive ? "text-ryzen-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <item.icon size={18} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
