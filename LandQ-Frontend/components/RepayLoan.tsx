import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { LAND_LENDING_ADDRESS } from "@/lib/constants";
import LandLending_ABI from "../abi/LandLending_ABI.json";

interface RepayLoanProps {
  tokenId: number;
  amountOwedUSDT: bigint;
}

export default function RepayLoan({ tokenId, amountOwedUSDT }: RepayLoanProps) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRepay = async () => {
    if (!walletClient) return alert("Connect your wallet");

    const repayAmount = Number(amount) * 1_000_000;
    if (isNaN(repayAmount) || repayAmount <= 0)
      return alert("Enter a valid amount");

    try {
      setLoading(true);
      const txHash = await walletClient.writeContract({
        address: LAND_LENDING_ADDRESS,
        abi: LandLending_ABI,
        functionName: "repayLoan",
        args: [tokenId, BigInt(repayAmount), false], // isBTC=false
      });

      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      alert("Loan repaid!");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Repay failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <p className="font-medium">Amount owed: {(Number(amountOwedUSDT) / 1_000_000).toLocaleString()} USDT</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-full mt-2 mb-2"
        placeholder="Enter repayment amount"
      />
      <button
        onClick={handleRepay}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full sticky bottom-4"
      >
        {loading ? "Repaying..." : "Repay Loan"}
      </button>
    </div>
  );
}
