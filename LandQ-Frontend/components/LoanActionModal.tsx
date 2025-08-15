// components/LoanActionModal.tsx
import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { writeContract } from "viem/actions";
import { formatUnits, parseUnits } from "viem/utils";
import { LAND_LENDING_ADDRESS } from "@/lib/constants";
import LandLending from "../abi/LandLending_ABI.json";

export default function LoanActionModal({
  tokenId,
  appraisalPriceUSDT,
  loan,
  isVerified,
  onClose,
}: {
  tokenId: number;
  appraisalPriceUSDT: number;
  loan: any;
  isVerified: boolean;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isBTC, setIsBTC] = useState(false);
  const [loanPeriod, setLoanPeriod] = useState(30);
  const [btcRate, setBtcRate] = useState<number | null>(null);
  const [amountOwedBTC, setAmountOwedBTC] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch BTC rate from contract
  useEffect(() => {
    async function fetchRate() {
      try {
        const rate = await publicClient.readContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending,
          functionName: "btcPriceUSDT",
        });
        setBtcRate(Number(rate)); // This is in 6 decimals (USDT smallest unit)
      } catch (err) {
        console.error("Error fetching BTC rate", err);
      }
    }
    fetchRate();
  }, [publicClient]);

  // Convert amount owed to BTC
  useEffect(() => {
    if (!btcRate || !loan?.amountOwed) return;
    const btcValue =
      (Number(loan.amountOwed) * 1e8) / Number(btcRate); // USDT smallest units -> BTC
    setAmountOwedBTC(formatUnits(BigInt(Math.floor(btcValue)), 8));
  }, [btcRate, loan]);

  async function handleApply() {
    if (!walletClient) return;
    setLoading(true);
    try {
      await writeContract(walletClient, {
        address: LAND_LENDING_ADDRESS,
        abi: LandLending,
        functionName: "applyForLoan",
        args: [BigInt(tokenId), BigInt(loanPeriod)],
      });
      onClose();
    } catch (err) {
      console.error("Apply Loan Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRepay() {
    if (!walletClient || !loan) return;
    setLoading(true);
    try {
      const amount = BigInt(loan.amountOwed); // already in smallest units
      await writeContract(walletClient, {
        address: LAND_LENDING_ADDRESS,
        abi: LandLending,
        functionName: "repayLoan",
        args: [BigInt(tokenId), amount, isBTC],
      });
      onClose();
    } catch (err) {
      console.error("Repay Loan Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Loan Actions</h2>

        {btcRate && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              BTC Rate:{" "}
              <span className="font-semibold">
                {Number(btcRate) / 1e6} USDT / BTC
              </span>
            </p>
          </div>
        )}

        {loan ? (
          <div className="mb-4">
            <p>Principal: {Number(loan.principal) / 1e6} USDT</p>
            <p>Amount Owed: {Number(loan.amountOwed) / 1e6} USDT</p>
            {amountOwedBTC && (
              <p>
                Amount Owed (BTC): <strong>{amountOwedBTC}</strong>
              </p>
            )}
            <p>Due Date: {new Date(Number(loan.dueDate) * 1000).toLocaleString()}</p>
            <p>Status: {loan.isActive ? "Active" : "Closed"}</p>
          </div>
        ) : (
          isVerified && (
            <div className="mb-4">
              <label className="block mb-1">Loan Period (days)</label>
              <input
                type="number"
                value={loanPeriod}
                onChange={(e) => setLoanPeriod(Number(e.target.value))}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          )
        )}

        <div className="mb-4 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isBTC}
            onChange={() => setIsBTC(!isBTC)}
          />
          <label>Repay with BTC</label>
        </div>

        <div className="sticky bottom-0 bg-white py-3 flex justify-between space-x-2">
          {!loan && isVerified && (
            <button
              onClick={handleApply}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex-1"
            >
              {loading ? "Applying..." : "Apply Loan"}
            </button>
          )}
          {loan && loan.isActive && (
            <button
              onClick={handleRepay}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1"
            >
              {loading ? "Repaying..." : "Repay Loan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
