interface WalletConnectProps {
  isConnected: boolean;
  isDemoMode: boolean;
  userAddress: string | null;
  onConnect: () => void;
}

export function WalletConnect({
  isConnected,
  isDemoMode,
  userAddress,
  onConnect
}: WalletConnectProps) {
  const getButtonText = () => {
    if (isDemoMode) return 'Demo Mode';
    if (isConnected) return 'Connected';
    return 'Connect Wallet';
  };

  const getAddressText = () => {
    if (!userAddress) return isDemoMode ? '(No Wallet)' : '';
    return `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
  };

  return (
    <div className="flex gap-2 sm:gap-4 items-center flex-col sm:flex-row">
      <button
        onClick={onConnect}
        disabled={isConnected}
        className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] px-3 sm:px-5 py-2 sm:py-3 border-3 border-[#00d4ff] bg-[#00d4ff] text-[#0f0f1e] uppercase transition-all disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>
      <div className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] text-[#00d4ff]">
        {getAddressText()}
      </div>
    </div>
  );
}
