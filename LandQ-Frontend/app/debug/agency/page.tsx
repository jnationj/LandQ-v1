'use client';

import { encodeBytes32String } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import LandVerifierABI from "@/abi/LandVerifier_ABI.json";
import { LAND_VERIFIER_ADDRESS } from "@/lib/constants";

export default function useAgencyCheck(agencyState: string) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [isApprovedAgency, setIsApprovedAgency] = useState(false);
  const [checkingAgency, setCheckingAgency] = useState(true);

  useEffect(() => {
    const checkAgency = async () => {
      // STEP 1 — Validate inputs
      console.log("=== DEBUG AGENCY CHECK START ===");
      console.log("Connected:", isConnected);
      console.log("Wallet address:", address);
      console.log("Agency state:", agencyState);

      if (!publicClient) {
        console.log("❌ No public client available yet");
        return;
      }
      if (!isConnected) {
        console.log("❌ Wallet not connected");
        return;
      }
      if (!address) {
        console.log("❌ No wallet address loaded");
        return;
      }
      if (!agencyState) {
        console.log("❌ No agency state provided");
        return;
      }

      try {
        setCheckingAgency(true);

        // STEP 2 — Encode agency state
        const stateBytes32 = encodeBytes32String(agencyState);
        console.log("Encoded state (bytes32):", stateBytes32);

        // STEP 3 — Read from contract
        const result = await publicClient.readContract({
          address: LAND_VERIFIER_ADDRESS,
          abi: LandVerifierABI,
          functionName: "getAgency",
          args: [stateBytes32],
        });

        console.log("Raw contract result:", result);

        // STEP 4 — Extract address from result
        const onChainAgencyAddress = Array.isArray(result) ? result[0] : result;
        console.log("On-chain agency (raw):", onChainAgencyAddress);

        // STEP 5 — Normalize for comparison
        const normalizedOnChain = String(onChainAgencyAddress || "").toLowerCase();
        const normalizedWallet = String(address || "").toLowerCase();

        console.log("Normalized wallet:", normalizedWallet);
        console.log("Normalized on-chain:", normalizedOnChain);

        // STEP 6 — Compare and set
        const matches = normalizedOnChain === normalizedWallet;
        console.log("Match result:", matches ? "✅ YES" : "❌ NO");

        setIsApprovedAgency(matches);
      } catch (err: any) {
        console.error("❌ Error checking agency:", err);
        setIsApprovedAgency(false);
      } finally {
        setCheckingAgency(false);
        console.log("=== DEBUG AGENCY CHECK END ===");
      }
    };

    // Only run when everything is ready
    if (publicClient && isConnected && address && agencyState) {
      checkAgency();
    }
  }, [publicClient, isConnected, address, agencyState]);

  return { isApprovedAgency, checkingAgency };
}
