"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BarChart2, Zap, Settings } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "記録", icon: Clock },
  { href: "/stats", label: "統計", icon: BarChart2 },
  { href: "/activities", label: "活動", icon: Zap },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <ul className="flex items-stretch justify-around h-14 max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "relative flex flex-col items-center justify-center gap-1 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className={clsx("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
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
