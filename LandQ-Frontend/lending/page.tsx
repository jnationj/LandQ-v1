'use client';

import { useState, useEffect } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { LAND_LENDING_ADDRESS } from "@/lib/constants";
import LandLending from "../../abi/LandLending_ABI.json";

interface LoanModalProps {
  mode: "apply" | "repay";
  tokenId: number;
  appraisalPriceUSDT?: number; // only needed for apply
  amountOwedUSDT?: number;     // only needed for repay
  isVerified: boolean;
  onClose: () => void;
}

const loanPeriods = [
  { label: "1 Hour", value: 3600 },
  { label: "6 Hours", value: 21600 },
  { label: "24 Hours", value: 86400 },
];

export default function LoanModal({
  mode,
  tokenId,
  appraisalPriceUSDT = 0,
  amountOwedUSDT = 0,
  isVerified,
  onClose
}: LoanModalProps) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [amount, setAmount] = useState<string>("");
  const [period, setPeriod] = useState<number>(3600);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [btcPriceUSDT, setBtcPriceUSDT] = useState<bigint>(BigInt(0));
  const [btcEquivalent, setBtcEquivalent] = useState<string>("");
  const [isBTC, setIsBTC] = useState<boolean>(false);

  // Fetch BTC price
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const price = (await publicClient.readContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending,
          functionName: "btcPriceUSDT",
        })) as bigint;
        setBtcPriceUSDT(price);
      } catch (err) {
        console.error("Error fetching BTC price:", err);
      }
    };
    if (publicClient) fetchBtcPrice();
  }, [publicClient]);

  // Update BTC equivalent when amount changes
  useEffect(() => {
    if (!amount || btcPriceUSDT === BigInt(0)) {
      setBtcEquivalent("");
      return;
    }
    try {
      const usdtInSmallest = parseUnits(amount, 6);
      const btc = (usdtInSmallest * (BigInt(10) ** BigInt(8))) / btcPriceUSDT;
      setBtcEquivalent(formatUnits(btc, 8));
    } catch {
      setBtcEquivalent("");
    }
  }, [amount, btcPriceUSDT]);

  if (!isVerified) return null;

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      if (!walletClient) throw new Error("Wallet not connected");

      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum <= 0) throw new Error("Enter valid amount");

      if (mode === "apply") {
        const maxLoan = appraisalPriceUSDT / 2;
        if (amountNum > maxLoan) throw new Error("Loan exceeds 50% of appraisal");

        setLoading(true);
        const txHash = await walletClient.writeContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending,
          functionName: "issueLoan",
          args: [
            BigInt(tokenId),
            parseUnits(amount, 6),
            BigInt(period),
          ],
        });
        setSuccess(`Loan transaction sent: ${txHash}`);
      }

      if (mode === "repay") {
        setLoading(true);
        const txHash = await walletClient.writeContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending,
          functionName: "repayLoan",
          args: [
            BigInt(tokenId),
            parseUnits(amount, 6),
            isBTC
          ],
        });
        setSuccess(`Repay transaction sent: ${txHash}`);
      }

    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "apply" ? "Apply for Loan" : "Repay Loan";
  const placeholder = mode === "apply" ? "Enter loan amount" : "Enter repayment amount";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {btcPriceUSDT > BigInt(0) && (
          <p className="text-sm text-gray-600 mb-2">
            1 BTC = {(Number(formatUnits(btcPriceUSDT, 6))).toLocaleString()} USDT
          </p>
        )}

        {mode === "apply" && (
          <p className="mb-2 text-sm text-gray-600">
            Max loan: {(appraisalPriceUSDT / 2).toLocaleString()} USDT
          </p>
        )}

        <label className="block mb-2 text-sm font-medium">
          {mode === "apply" ? "Loan Amount (USDT)" : "Repayment Amount (USDT)"}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg p-2 mb-2"
          placeholder={placeholder}
        />
        {btcEquivalent && (
          <p className="text-xs text-gray-500 mb-4">≈ {btcEquivalent} BTC</p>
        )}

        {mode === "apply" && (
          <>
            <label className="block mb-2 text-sm font-medium">Loan Period</label>
            <div className="mb-4 flex flex-col gap-2">
              {loanPeriods.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="loanPeriod"
                    value={value}
                    checked={period === value}
                    onChange={() => setPeriod(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </>
        )}

        {mode === "repay" && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm">Pay with BTC:</span>
            <input
              type="checkbox"
              checked={isBTC}
              onChange={() => setIsBTC(!isBTC)}
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        {/* Sticky bottom buttons */}
        <div className="mt-auto sticky bottom-0 bg-white py-3 flex gap-3 justify-end border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
