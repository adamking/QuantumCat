interface ActionButtonsProps {
  canUnbox: boolean;
  canRebox: boolean;
  onUnbox: () => void;
  onRebox: () => void;
  onRefresh: () => void;
}

export function ActionButtons({
  canUnbox,
  canRebox,
  onUnbox,
  onRebox,
  onRefresh
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button
        onClick={onUnbox}
        disabled={!canUnbox}
        className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] px-4 py-3 border-3 border-[#00ff41] bg-[#16213e] text-white uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#00ff41] hover:enabled:text-[#0f0f1e] hover:enabled:shadow-[0_0_15px_#00ff41] hover:enabled:-translate-y-0.5 active:enabled:translate-y-0 min-w-[150px]"
      >
        🔓 BREAK SEAL & UNBOX
      </button>
      <button
        onClick={onRebox}
        disabled={!canRebox}
        className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] px-4 py-3 border-3 border-[#00ff41] bg-[#16213e] text-white uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#00ff41] hover:enabled:text-[#0f0f1e] hover:enabled:shadow-[0_0_15px_#00ff41] hover:enabled:-translate-y-0.5 active:enabled:translate-y-0 min-w-[150px]"
      >
        📦 RESEAL (Combine to QCAT)
      </button>
      <button
        onClick={onRefresh}
        className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] px-4 py-3 border-3 border-[#00ff41] bg-[#16213e] text-white uppercase transition-all hover:bg-[#00ff41] hover:text-[#0f0f1e] hover:shadow-[0_0_15px_#00ff41] hover:-translate-y-0.5 active:translate-y-0 min-w-[150px]"
      >
        🔄 Refresh Balances
      </button>
    </div>
  );
}
