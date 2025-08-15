import { readContract } from "viem/actions";
// import { formatUnits } from "viem";
import LandLendingABI from "@/abi/LandLending_ABI.json";
import { LAND_LENDING_ADDRESS } from "@/lib/constants";

import { usePublicClient, useWalletClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";

export async function fetchBTCPriceUSDT(publicClient: any, contractAddress: `0x${string}`) {
  const btcPriceUSDT = await readContract(publicClient, {
    address: contractAddress,
    abi: LandLendingABI,
    functionName: "btcPriceUSDT",
  });
  return {
    raw: btcPriceUSDT, // bigint in smallest USDT units (1e6)
    formatted: Number(formatUnits(btcPriceUSDT as bigint, 6)), // USDT rate for 1 BTC
  };
}

export function usdtToBTC(usdtAmount: bigint, btcPriceUSDT: bigint) {
  if (btcPriceUSDT === BigInt(0)) return 0;
  const btcSmallest = (usdtAmount * BigInt(10) ** BigInt(8)) / btcPriceUSDT; // BTC smallest units
  return Number(btcSmallest) / 1e8; // BTC in whole units
}

