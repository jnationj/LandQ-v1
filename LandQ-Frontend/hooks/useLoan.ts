import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import LandLending_ABI from "../abi/LandLending_ABI.json";
import { LAND_LENDING_ADDRESS } from "../lib/constants";

export interface LoanData {
  borrower: string;
  principalUSDT: bigint;
  amountOwedUSDT: bigint;
  dueTimestamp: bigint;
  tokenId: number;
  status: number;
}

export function useLoan(tokenId: number | null) {
  const publicClient = usePublicClient();
  const [loan, setLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenId || !publicClient) return;

    const fetchLoan = async () => {
      setLoading(true);
      try {
        const loanRaw = await publicClient.readContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending_ABI,
          functionName: "loans",
          args: [tokenId],
        });

        setLoan({
          borrower: loanRaw[0],
          principalUSDT: loanRaw[1],
          amountOwedUSDT: loanRaw[2],
          dueTimestamp: loanRaw[3],
          tokenId: Number(loanRaw[4]),
          status: Number(loanRaw[5]),
        });
      } catch (err) {
        console.error("Failed to fetch loan:", err);
        setLoan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [tokenId, publicClient]);

  return { loan, loading };
}
