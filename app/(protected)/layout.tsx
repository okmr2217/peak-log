import { requireUser } from "@/lib/session";
import LogoutButton from "@/components/logout-button";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-[#7C4DFF]">Peak Log</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
