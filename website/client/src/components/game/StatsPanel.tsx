interface StatsPanelProps {
  totalUnboxed: number;
  sessionScore: number;
  aliveCount: number;
  deadCount: number;
}

export function StatsPanel({
  totalUnboxed,
  sessionScore,
  aliveCount,
  deadCount
}: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
      <div className="flex justify-between p-4 bg-[#0f0f1e] border-2 border-[#00ff41]">
        <span className="font-['Press_Start_2P'] text-[10px] text-white">Total Unboxed:</span>
        <span className="font-['Press_Start_2P'] text-xs text-[#00ff41]">{totalUnboxed}</span>
      </div>
      <div className="flex justify-between p-4 bg-[#0f0f1e] border-2 border-[#00ff41]">
        <span className="font-['Press_Start_2P'] text-[10px] text-white">Session Score:</span>
        <span className="font-['Press_Start_2P'] text-xs text-[#00ff41]">{sessionScore}</span>
      </div>
      <div className="flex justify-between p-4 bg-[#0f0f1e] border-2 border-[#00ff41]">
        <span className="font-['Press_Start_2P'] text-[10px] text-white">Alive/Dead Ratio:</span>
        <span className="font-['Press_Start_2P'] text-xs text-[#00ff41]">
          {aliveCount}/{deadCount}
        </span>
      </div>
    </div>
  );
}
