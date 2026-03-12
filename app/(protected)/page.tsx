import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="px-4 py-8">
      <h2 className="text-lg font-semibold text-white mb-1">ホーム</h2>
      <p className="text-zinc-500 text-sm">ようこそ、{user?.name ?? user?.email} さん</p>
    </div>
  );
}
