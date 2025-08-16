// app/owner/agency/page.tsx
"use client";
import { useState } from "react";
import { setAgency } from "@/lib/landVerifier";
import { parseUnits } from "viem";

export default function OwnerAgencyPage() {
  const [region, setRegion] = useState("");
  const [agencyAddr, setAgencyAddr] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      const feeInWei = parseUnits(fee, 18); // assuming fee is in ETH
      const tx = await setAgency(region, agencyAddr as `0x${string}`, feeInWei);
      setTxHash(tx.hash);
    } catch (err) {
      console.error(err);
      alert("Error setting agency");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Set Agency</h1>

      <label className="block mb-2">Region</label>
      <input
        type="text"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder="Enter region"
        className="border p-2 w-full mb-4"
      />

      <label className="block mb-2">Agency Address</label>
      <input
        type="text"
        value={agencyAddr}
        onChange={(e) => setAgencyAddr(e.target.value)}
        placeholder="0x..."
        className="border p-2 w-full mb-4"
      />

      <label className="block mb-2">Fee (ETH)</label>
      <input
        type="number"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        placeholder="0.01"
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded"
      >
        {loading ? "Submitting..." : "Set Agency"}
      </button>

      {txHash && (
        <p className="mt-4 text-green-600">
          ✅ Transaction submitted:{" "}
          <a
            href={`https://explorer.yourchain.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Explorer
          </a>
        </p>
      )}
    </div>
  );
}
