import { requireUser } from "@/lib/session";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
