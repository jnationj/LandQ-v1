'use client';

import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import TokenTransfer from "../tokentx/page"; // Adjust the import path as necessary

export default function DAppPage() {
  const { isConnected } = useAccount();

  return (
    <RainbowKitProvider>
      <div className="p-4">
        <ConnectButton />
        {isConnected && <TokenTransfer />}
      </div>
    </RainbowKitProvider>
  );
}