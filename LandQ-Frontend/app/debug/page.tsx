"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { encodeBytes32String } from "ethers";
import { isAddressEqual, zeroAddress } from "viem";
import LandVerifierABI from "@/abi/LandVerifier_ABI.json";
import { LAND_VERIFIER_ADDRESS } from "@/lib/constants";

export default function DebugAgencyPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [region, setRegion] = useState("Lagos"); // try "Lagos" vs "Lagos State"
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState<any>(null);
  const [agencyAddr, setAgencyAddr] = useState<`0x${string}` | null>(null);
  const [fee, setFee] = useState<bigint | null>(null);
  const [match, setMatch] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    if (!publicClient) return;
    setLoading(true);
    setError(null);
    setMatch(null);
    setAgencyAddr(null);
    setFee(null);
    setRawResult(null);

    try {
      const bytes = encodeBytes32String(region);
      console.log("Region string -> bytes32", { region, bytes });

      const result = await publicClient.readContract({
        address: LAND_VERIFIER_ADDRESS,
        abi: LandVerifierABI,
        functionName: "getAgency",
        args: [bytes],
      });

      console.log("Raw getAgency() result:", result, "Array?", Array.isArray(result));
      setRawResult(result);

      // Extract tuple safely
      let onChainAddress: `0x${string}` | null = null;
      let onChainFee: bigint | null = null;

      if (Array.isArray(result)) {
        // Most common: [address, uint256]
        onChainAddress = result[0] as `0x${string}`;
        onChainFee = result[1] as bigint;
      } else if (typeof result === "object" && result !== null) {
        // If ABI coder returned a struct-like object
        const maybeAddr = (result as any)[0] ?? (result as any).agency ?? (result as any).addr;
        const maybeFee = (result as any)[1] ?? (result as any).fee;
        onChainAddress = maybeAddr as `0x${string}`;
        onChainFee = maybeFee as bigint;
      } else if (typeof result === "string") {
        // Edge case: address only
        onChainAddress = result as `0x${string}`;
      }

      setAgencyAddr(onChainAddress);
      if (typeof onChainFee === "bigint") setFee(onChainFee);

      if (!onChainAddress || onChainAddress === zeroAddress) {
        setMatch(false);
        return;
      }

      if (isConnected && address) {
        const equal = isAddressEqual(onChainAddress, address as `0x${string}`);
        setMatch(equal);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // auto run when connected
    if (isConnected) runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Debug: getAgency(regionBytes32)</h1>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder='Try "Lagos" or "Lagos State"'
        />
        <button
          onClick={runCheck}
          disabled={loading || !publicClient}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <div><b>Connected:</b> {isConnected ? "Yes" : "No"}</div>
        <div><b>Wallet:</b> {address ?? "—"}</div>
        <div><b>Contract:</b> {LAND_VERIFIER_ADDRESS}</div>
      </div>

      {error && (
        <pre className="bg-red-50 border border-red-200 text-red-700 p-3 rounded whitespace-pre-wrap">
          {error}
        </pre>
      )}

      {rawResult && (
        <details open className="bg-gray-50 border p-3 rounded">
          <summary className="cursor-pointer font-medium">Raw contract result</summary>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(rawResult, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2)}
          </pre>
        </details>
      )}

      <div className="border rounded p-3">
        <div><b>Agency Address (on-chain):</b> {agencyAddr ?? "—"}</div>
        <div><b>Fee (raw uint256):</b> {fee != null ? fee.toString() : "—"}</div>
        <div>
          <b>Matches wallet?</b>{" "}
          {match == null ? "—" : match ? "✅ Yes" : "❌ No"}
        </div>
        {agencyAddr === zeroAddress && (
          <div className="text-orange-600 mt-2">
            The contract returned the zero address. This usually means the region key doesn’t exist.
            Try adjusting the region string (e.g., include “State”, proper casing, spacing).
          </div>
        )}
      </div>
    </div>
  );
}
