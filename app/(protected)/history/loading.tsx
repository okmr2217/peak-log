function SkeletonCard() {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-white/10 rounded" />
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="ml-auto h-3 w-10 bg-white/10 rounded" />
      </div>
      <div className="mt-2 h-3 w-16 bg-white/5 rounded" />
    </div>
  );
}

function SkeletonGroup({ cardCount }: { cardCount: number }) {
  return (
    <div>
      <div className="h-3 w-10 bg-white/5 rounded mb-2 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HistoryLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="h-7 w-12 bg-white/5 rounded-lg mb-5 animate-pulse" />
      <div className="space-y-6">
        <SkeletonGroup cardCount={2} />
        <SkeletonGroup cardCount={3} />
        <SkeletonGroup cardCount={1} />
      </div>
    </div>
  );
}
