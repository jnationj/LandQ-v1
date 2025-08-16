"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import axios from "axios";
import { 
  LAND_VERIFIER_ADDRESS, 
  LAND_NFT_ADDRESS, 
  LAND_LENDING_ADDRESS, 
  USDT_TOKEN_ADDRESS, 
  BTC_TOKEN_ADDRESS
 } from "@/lib/constants";
import LandVerifier from "../../abi/LandVerifier_ABI.json";
import LandNFT from "../../abi/LandNFT_ABI.json";
import LandLending_ABI from "../../abi/LandLending_ABI.json";
import { erc20Abi } from "viem";
import { formatEther } from "viem";
import { encodeBytes32String } from "ethers";
import LoanRatesView from "@/components/LoanRatesView";
import LoanDetails from "@/components/LoanDetails";
import LandCard from "@/components/LandCard";
import LoanActionModal from "@/components/LoanActionModal";
import { saveVerificationData  } from "@/utils/firebaseUtils";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";


interface Loan {
  borrower: string;
  principalUSDT: bigint;
  amountOwedUSDT: bigint;
  dueTimestamp: number;
  tokenId: number;
  status: number;
}

function normalizeIpfsUri(uri: string) {
  return uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
}

export default function MyNFTs() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [ownedTokenIds, setOwnedTokenIds] = useState<number[]>([]);
  const [nftMetadata, setNftMetadata] = useState<Record<number, any>>({});
  const [verificationData, setVerificationData] = useState<Record<number, any>>({});
  const [verificationFees, setVerificationFees] = useState<Record<number, bigint>>({});
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loanPeriod, setLoanPeriod] = useState<number>(3600); // default 1 hour
  const [nftPrices, setNftPrices] = useState<Record<number, string>>({});
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcOwed, setBtcOwed] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  


  const [repayAmount, setRepayAmount] = useState<string>("");
  const [repayWithBTC, setRepayWithBTC] = useState<boolean>(false);

  const loanPeriods = [
    { label: "1 Hour", value: 3600 },
    { label: "6 Hours", value: 21600 },
    { label: "24 Hours", value: 86400 },
  ];

  const MAX_TOKENS = 40; // give more allowance to view token up to tokenId:40


  // At the top of your component

const handleRequestVerification = async (tokenId: number) => {
  const fee = verificationFees[tokenId];
  if (!walletClient || fee == null) return;

  setLoadingRequest(true);
  try {
    const txHash = await walletClient.writeContract({
      address: LAND_VERIFIER_ADDRESS,
      abi: LandVerifier,
      functionName: "requestVerification",
      args: [tokenId],
      value: fee,
    });

    if (!publicClient) {
      throw new Error("Public client is not available");
    }
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    alert("Verification requested!");

    // Fetch token metadata
    let tokenUri: string = await publicClient.readContract({
      address: LAND_NFT_ADDRESS,
      abi: LandNFT,
      functionName: "uri",
      args: [tokenId],
    });

    if (tokenUri.startsWith("ipfs://")) {
      tokenUri = `https://ipfs.io/ipfs/${tokenUri.replace("ipfs://", "")}`;
    }

    const metadata = await fetch(tokenUri).then(res => res.json());

    // Save request in Firebase
    await saveVerificationData({
      tokenId,
      metadataUrl: tokenUri,
      image: metadata.image || "",
      state: metadata.state || "",
      walletAddress: address || "",
    });

    setVerificationData(prev => ({
      ...prev,
      [tokenId]: { ...prev[tokenId], hasPending: true },
    }));
  } catch (err) {
    alert("Verification failed.");
    console.error(err);
  } finally {
    setLoadingRequest(false);
  }
};



  useEffect(() => {
    async function fetchRates() {
      try {
        const price = await publicClient.readContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending_ABI,
          functionName: "btcPriceUSDT",
        });
        setBtcPrice(price);

        if (loan && loan.status === 1) {
          const owedBtc = await publicClient.readContract({
            address: LAND_LENDING_ADDRESS,
            abi: LandLending_ABI,
            functionName: "usdtToBtcMock",
            args: [loan.amountOwedUSDT], // amountOwed should be in USDT smallest units
          });
          setBtcOwed(owedBtc);
        }
      } catch (err) {
        console.error("Error fetching BTC rate:", err);
      }
    }
    fetchRates();
  }, [loan]);

  useEffect(() => {
    if (!address) return;
    const fetchNFTs = async () => {
      const tokens: number[] = [];
      for (let tokenId = 1; tokenId <= MAX_TOKENS; tokenId++) {
        try {
          const res = await fetch(`/api/nft-check?account=${address}&tokenId=${tokenId}`);
          const json = await res.json();
          if (json.owns) tokens.push(tokenId);
        } catch (err) {
          console.error("Error checking token", tokenId, err);
        }
      }
      setOwnedTokenIds(tokens);
    };
    fetchNFTs();
  }, [address]);

  useEffect(() => {
    if (!publicClient) return;
    const loadMetadataAndVerification = async () => {
      for (const tokenId of ownedTokenIds) {
        try {
          const { uri } = await readTokenURI(tokenId);
          const meta = await axios.get(normalizeIpfsUri(uri));
          setNftMetadata(prev => ({ ...prev, [tokenId]: meta.data }));

          if (meta.data.state) {
            try {
              const regionBytes32 = encodeBytes32String(meta.data.state);
              const agencyInfo = await publicClient.readContract({
                address: LAND_VERIFIER_ADDRESS,
                abi: LandVerifier,
                functionName: "getAgency",
                args: [regionBytes32],
              });
              const fee = (agencyInfo as [string, bigint])[1];
              setVerificationFees(prev => ({ ...prev, [tokenId]: fee }));
            } catch {}
          }

          const [isVerified, hasPending] = await Promise.all([
            publicClient.readContract({ address: LAND_NFT_ADDRESS, abi: LandNFT, functionName: "isVerified", args: [tokenId] }),
            publicClient.readContract({ address: LAND_VERIFIER_ADDRESS, abi: LandVerifier, functionName: "hasPendingRequest", args: [tokenId] }),
          ]);

          setVerificationData(prev => ({ ...prev, [tokenId]: { isVerified, hasPending } }));
        } catch (err) {
          console.error("Failed to load metadata/verification for token", tokenId, err);
        }
      }
    };

    if (ownedTokenIds.length > 0) loadMetadataAndVerification();
  }, [ownedTokenIds, publicClient]);

  useEffect(() => {
    if (!selectedTokenId || !publicClient) return;

    const fetchLoan = async () => {
      try {
        const loanData = (await publicClient.readContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending_ABI,
          functionName: "loans",
          args: [selectedTokenId],
        })) as [string, bigint, bigint, bigint, number, number];

        const updatedLoan = {
          borrower: loanData[0],
          principalUSDT: loanData[1],
          amountOwedUSDT: loanData[2],
          dueTimestamp: Number(loanData[3]),
          tokenId: Number(loanData[4]),
          status: Number(loanData[5]),
        };

        setLoan(updatedLoan);

        // 💡 UI logic: mark complete only if owed is zero AND status == Repaid
        const isFullyRepaid = updatedLoan.amountOwedUSDT === 0n && updatedLoan.status === 2;
        if (isFullyRepaid) {
          console.log("✅ Loan fully repaid!");
        } else {
          console.log(`ℹ️ Partial payment. Remaining: ${Number(updatedLoan.amountOwedUSDT) / 1_000_000} USDT`);
        }
      } catch (err) {
        console.error("Failed to fetch loan", err);
        setLoan(null);
      }
    };

    fetchLoan();
  }, [selectedTokenId, publicClient]);


  const handleViewPrice = async (tokenId: number) => {
    if (!publicClient) return;
    setLoadingPrice(true);
    try {
      const priceUSD = await publicClient.readContract({
        address: LAND_VERIFIER_ADDRESS,
        abi: LandVerifier,
        functionName: "getAppraisedPrice",
        args: [tokenId],
      });
      setNftPrices(prev => ({ ...prev, [tokenId]: (Number(priceUSD) / 1_000_000).toString() }));
    } catch (err) {
      setNftPrices(prev => ({ ...prev, [tokenId]: "Error" }));
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleApplyLoan = async (tokenId: number) => {
      if (!walletClient) return;
      const requestedLoanAmountUSDT = prompt("Enter requested loan amount in USDT:");
      if (!requestedLoanAmountUSDT || !loanPeriod) return;

      try {
        const txHash = await walletClient.writeContract({
          address: LAND_LENDING_ADDRESS,
          abi: LandLending_ABI,
          functionName: "issueLoan",
          args: [
            tokenId,
            BigInt(Number(requestedLoanAmountUSDT) * 1_000_000),
            BigInt(loanPeriod),
          ],
        });
        await publicClient?.waitForTransactionReceipt({ hash: txHash });
        alert("Loan application submitted!");
      } catch (err) {
        console.error(err);
        alert("Loan application failed");
      }
    };


  const handleRepayLoan = async (tokenId: number, amount: string, isBTC: boolean) => {
    if (!walletClient) return;
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid repayment amount");
      return;
    }

    try {
      // 1. Select token address
      const tokenAddress = isBTC ? BTC_TOKEN_ADDRESS : USDT_TOKEN_ADDRESS;

      // 2. Get decimals
      const tokenDecimals = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      });
      const tokenDecimalsNumber = Number(tokenDecimals);

      // 3. Convert human amount to token units
      const scaledAmount = BigInt(Math.floor(Number(amount) * 10 ** tokenDecimalsNumber));

      // 4. Check allowance
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [walletClient.account.address, LAND_LENDING_ADDRESS],
      });

      // 5. Approve if needed
      if (allowance < scaledAmount) {
        const approveHash = await walletClient.writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [LAND_LENDING_ADDRESS, scaledAmount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log("✅ Approval complete");
      } else {
        console.log("✅ Already approved");
      }

      // 6. Call repayLoan
      const repayHash = await walletClient.writeContract({
        address: LAND_LENDING_ADDRESS,
        abi: LandLending_ABI,
        functionName: "repayLoan",
        args: [tokenId, scaledAmount, isBTC],
      });

      await publicClient.waitForTransactionReceipt({ hash: repayHash });

      // 7. Fetch updated loan data
      const loanData = await publicClient.readContract({
        address: LAND_LENDING_ADDRESS,
        abi: LandLending_ABI,
        functionName: "loans",
        args: [tokenId],
      }) as [string, bigint, bigint, bigint, number, number];

      const remainingUSDT = Number(loanData[2]) / 1e6; // always USDT equivalent

      if (loanData[2] === 0n && loanData[5] === 2) {
        alert(`✅ Loan fully repaid! NFT unlocked.`);
      } else {
        alert(`💰 Partial repayment made. Remaining balance: ${remainingUSDT.toFixed(6)} USDT`);
      }

      setRepayAmount("");
      setRepayWithBTC(false);

    } catch (err) {
      console.error(err);
      alert("Repayment failed");
    }
  };





  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">My Land NFTs</h1>

      {ownedTokenIds.length === 0 ? (
        <p>No NFTs found in your wallet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ownedTokenIds.map(tokenId => {
            const meta = nftMetadata[tokenId];
            return (
              <div key={tokenId} className="border p-4 rounded shadow cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTokenId(tokenId)}>
                <p className="font-semibold">Token ID: {tokenId}</p>
                {meta ? (
                  <>
                    <img src={normalizeIpfsUri(meta.image)} alt="NFT" className="w-full h-48 object-cover mt-2" />
                    <h2 className="mt-2 font-bold">{meta.name}</h2>
                    <p className="text-sm truncate">{meta.description}</p>
                  </>
                ) : (
                  <p>Loading metadata...</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* NFT Modal */}
      {selectedTokenId !== null && nftMetadata[selectedTokenId] && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white max-w-md w-full rounded-lg shadow-lg relative flex flex-col max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setSelectedTokenId(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl z-10"
            >
              &times;
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-6 flex-1">
              <h2 className="text-xl font-semibold mb-2">Token ID: {selectedTokenId}</h2>
              <img src={normalizeIpfsUri(nftMetadata[selectedTokenId].image)} alt="NFT" className="w-full h-48 object-cover rounded" />
              <p className="mt-2 font-bold">{nftMetadata[selectedTokenId].name}</p>
              <p>{nftMetadata[selectedTokenId].description}</p>
              <p className="text-sm text-gray-600 mt-1"><strong>Location:</strong> {nftMetadata[selectedTokenId].state || "N/A"}</p>
              <p className="mt-1"><strong>Status:</strong> {verificationData[selectedTokenId]?.isVerified ? "✅ Verified" : verificationData[selectedTokenId]?.hasPending ? "⏳ Pending" : "❌ Not Verified"}</p>

              <p><strong>Verification Fee:</strong> {verificationFees[selectedTokenId] !== undefined ? `${formatEther(verificationFees[selectedTokenId])} tCORE2` : "Loading..."}</p>

              <p className="mt-2"><strong>Appraised Price:</strong> {nftPrices[selectedTokenId] !== undefined ? `${nftPrices[selectedTokenId]} USD` : "Not fetched yet"}</p>

              <button onClick={() => handleViewPrice(selectedTokenId)} disabled={loadingPrice} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {loadingPrice ? "Fetching Price..." : "View Price"}
              </button>

              {!verificationData[selectedTokenId]?.isVerified &&
                  !verificationData[selectedTokenId]?.hasPending && (
                    <button
                      onClick={() => handleRequestVerification(selectedTokenId)}
                      disabled={loadingRequest}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {loadingRequest ? "Requesting..." : "Request Verification"}
                    </button>
          )}


              {verificationData[selectedTokenId]?.isVerified && nftPrices[selectedTokenId] && (
                <>
                  <LoanRatesView tokenId={selectedTokenId} appraisalPriceUSDT={Number(nftPrices[selectedTokenId]) * 1_000_000} />

                  <div className="mt-4">
                    <p className="font-medium mb-2">Select Loan Period:</p>
                    <div className="flex flex-col gap-2">
                      {loanPeriods.map(({ label, value }) => (
                        <label key={value} className="flex items-center gap-2">
                          <input type="radio" name={`loanPeriod-${selectedTokenId}`} value={value} checked={loanPeriod === value} onChange={() => setLoanPeriod(value)} className="w-4 h-4" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Repay Amount + BTC Checkbox */}
                  {loan && loan.status === 1 && (
                    <div className="mt-4 flex flex-col gap-2">
                      <label>
                        Repay Amount:
                        <input type="number" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} className="ml-2 p-1 border rounded w-full" placeholder="Enter amount" />
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={repayWithBTC} onChange={() => setRepayWithBTC(!repayWithBTC)} className="w-4 h-4" />
                        Repay with BTC
                      </label>
                    </div>
                  )}

                  {/* Sticky Apply / Repay Button */}
                  <button
                    onClick={() => loan && loan.status === 1 ? handleRepayLoan(selectedTokenId, repayAmount, repayWithBTC) : handleApplyLoan(selectedTokenId)}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 sticky bottom-0 w-full"
                  >
                    {loan && loan.status === 1 ? "Repay Loan" : "Apply for Loan"}
                  </button>
                </>
              )}

              {loanModalOpen && selectedTokenId !== null && (
                <LoanActionModal
                  tokenId={selectedTokenId}
                  appraisalPriceUSDT={nftPrices[selectedTokenId]}
                  loan={loan}
                  isVerified={verificationData[selectedTokenId]?.isVerified}
                  onClose={() => setLoanModalOpen(false)}
                />
              )}

              {/* Loan Details */}
              {selectedTokenId && loan && loan.status === 1 && (
                <>
                  
                  <LoanDetails loan={loan} />

                  {/* BTC/USDT rate + Amount owed in BTC */}
                  <div className="mb-4 p-3 border rounded bg-gray-50">
                    <p className="text-sm">
                      <strong>BTC/USDT Rate:</strong>{" "}
                      {btcPrice ? `1 BTC = ${(Number(btcPrice) / 1_000_000).toLocaleString()} USDT` : "Loading..."}
                    </p>
                    {loan && loan.status === 1 && (
                      <p className="text-sm">
                        <strong>Amount Owed in BTC:</strong>{" "}
                        {btcOwed
                          ? `${(Number(btcOwed) / 1e8).toFixed(8)} BTC`
                          : "Loading..."}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium">Repayment Amount:</label>
                    <input
                      type="number"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="w-full border rounded px-3 py-2 mt-1"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isBTC"
                      checked={repayWithBTC}
                      onChange={(e) => setRepayWithBTC(e.target.checked)}
                    />
                    <label htmlFor="isBTC" className="text-sm">Repay with BTC</label>
                  </div>

                  <button
                    onClick={() =>
                      handleRepayLoan(selectedTokenId, repayAmount, repayWithBTC)
                    }
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 sticky bottom-0 w-full"
                  >
                    Repay Loan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility to read NFT URI
async function readTokenURI(tokenId: number) {
  const res = await fetch(`/api/nft-uri?tokenId=${tokenId}`);
  return await res.json();

}
