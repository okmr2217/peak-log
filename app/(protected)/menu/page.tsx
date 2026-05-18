import Link from "next/link";
import { Settings, HelpCircle, ChevronRight } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";

const menuItems = [
  { href: "/settings", label: "設定", description: "アカウント・テーマ・パスワード", icon: Settings },
  { href: "/help", label: "ヘルプ", description: "Peak Log の使い方", icon: HelpCircle },
];

export default function MenuPage() {
  return (
    <>
      <MobileHeader title="メニュー" />
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-card rounded-xl divide-y divide-border">
          {menuItems.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <Icon size={18} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
