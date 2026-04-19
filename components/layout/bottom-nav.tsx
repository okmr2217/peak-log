"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BarChart2, Zap, Menu, Settings, HelpCircle } from "lucide-react";
import { clsx } from "clsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navItems = [
  { href: "/", label: "記録", icon: Clock },
  { href: "/stats", label: "統計", icon: BarChart2 },
  { href: "/activities", label: "活動", icon: Zap },
];

const menuItems = [
  { href: "/settings", label: "設定", icon: Settings },
  { href: "/help", label: "ヘルプ", icon: HelpCircle },
];

export function BottomNav() {
  const pathname = usePathname();
  const isMenuActive = pathname.startsWith("/settings") || pathname.startsWith("/help");

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

        {/* メニューボタン */}
        <li className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={clsx(
                  "relative flex flex-col items-center justify-center gap-1 h-full w-full transition-colors",
                  isMenuActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isMenuActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary" />
                )}
                <Menu size={20} strokeWidth={isMenuActive ? 2 : 1.5} />
                <span className={clsx("text-[10px] font-medium", isMenuActive ? "text-primary" : "text-muted-foreground")}>
                  メニュー
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-44 p-1">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    pathname.startsWith(href) ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </PopoverContent>
          </Popover>
        </li>
      </ul>
    </nav>
  );
}
