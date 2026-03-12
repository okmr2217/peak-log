import { requireUser } from "@/lib/session";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
