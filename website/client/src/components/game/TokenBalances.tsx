interface TokenBalancesProps {
  qcat: number;
  alive: number;
  dead: number;
}

export function TokenBalances({ qcat, alive, dead }: TokenBalancesProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center p-4 bg-[#0f0f1e] border-2 border-[#00ff41]">
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-['Press_Start_2P']">🔮 QCAT:</span>
        <span className="text-sm sm:text-base font-['Press_Start_2P'] text-[#00ff41] min-w-[60px] text-right">
          {qcat.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-['Press_Start_2P']">🟢 ALIVE:</span>
        <span className="text-sm sm:text-base font-['Press_Start_2P'] text-[#00ff41] min-w-[60px] text-right">
          {alive.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-['Press_Start_2P']">🔴 DEAD:</span>
        <span className="text-sm sm:text-base font-['Press_Start_2P'] text-[#00ff41] min-w-[60px] text-right">
          {dead.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
