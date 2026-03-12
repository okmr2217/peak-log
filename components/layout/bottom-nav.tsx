"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Zap, Settings } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/history", label: "記録", icon: Clock },
  { href: "/activities", label: "ピーク", icon: Zap },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-zinc-800">
      <ul className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors",
                  isActive ? "text-[#7C4DFF]" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
