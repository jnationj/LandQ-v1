// app/agency/page.tsx
"use client";

import { useAccount, useContractRead } from "wagmi";
import CONTRACT_ABI from "../../abi/LandVerifier_ABI.json";
import { LAND_VERIFIER_ADDRESS } from "@/lib/constants";
import Link from "next/link";

const CONTRACT_ADDRESS = LAND_VERIFIER_ADDRESS;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function AgencyHome() {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useContractRead(
    isConnected && address
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "agencies",
          args: [address],
        }
      : ({} as any) // skip call if not connected
  );

  const agencyData = data as [string, bigint] | undefined;
  const isAgency = agencyData && agencyData[0] !== ZERO_ADDRESS;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Agency Portal</h1>

      {!isConnected && <p>Please connect your wallet to continue.</p>}

      {isConnected && (
        <>
          {isLoading ? (
            <p>Checking agency status...</p>
          ) : (
            <div className="space-y-4">
              {!isAgency && (
                <Link
                  href="/agency/apply"
                  className="block bg-green-600 text-white px-4 py-2 rounded text-center"
                >
                  Apply as an Agency
                </Link>
              )}
              {isAgency && (
                <Link
                  href="/agency/dashboard"
                  className="block bg-blue-600 text-white px-4 py-2 rounded text-center"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}