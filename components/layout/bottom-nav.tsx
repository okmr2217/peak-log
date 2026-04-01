"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BarChart2, Zap, Settings } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "タイムライン", icon: Clock },
  { href: "/stats", label: "統計", icon: BarChart2 },
  { href: "/activities", label: "ピーク", icon: Zap },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-white/5">
      <ul className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "relative flex flex-col items-center justify-center gap-1 h-full transition-colors",
                  isActive ? "text-[#7C4DFF]" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#7C4DFF]" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className={clsx("text-[10px] font-medium", isActive ? "text-[#7C4DFF]" : "text-zinc-600")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
