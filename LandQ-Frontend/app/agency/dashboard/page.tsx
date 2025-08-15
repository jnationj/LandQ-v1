"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import LandVerifierABI from "@/abi/LandVerifier_ABI.json";
import { LAND_VERIFIER_ADDRESS } from "@/lib/constants";

export default function AgencyDashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [agencyState, setAgencyState] = useState("");
  const [isApprovedAgency, setIsApprovedAgency] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState<{ [key: string]: boolean }>({});
  const [checkingAgency, setCheckingAgency] = useState(true);
  const [appraisalPrices, setAppraisalPrices] = useState<{ [key: string]: string }>({});

  // ✅ Check agency approval & listen to requests in real-time
  useEffect(() => {
    if (!isConnected || !address) return;

    console.log("🔍 Checking agency for wallet:", address);

    const q = query(
      collection(db, "agencyApplications"),
      where("wallet", "==", address)
    );

    const unsubscribeAgency = onSnapshot(q, (snap) => {
      console.log("📄 agencyApplications snapshot:", snap.docs.map(d => d.data()));

      if (!snap.empty) {
        const agencyDoc = snap.docs[0];
        const agencyData = agencyDoc.data();

        console.log("🔥 Agency data found:", agencyData);

        if (agencyData.wallet.toLowerCase() === address.toLowerCase()) {
          setIsApprovedAgency(true);
          setAgencyState(agencyData.state);

          console.log("✅ Agency approved, state:", agencyData.state);

          // Start listening to requests for this agency's state
          listenToRequests(agencyData.state);
        } else {
          console.log("❌ Wallet does not match Firebase record.");
          setIsApprovedAgency(false);
        }
      } else {
        console.log("❌ No agency found in Firebase for this wallet.");
        setIsApprovedAgency(false);
      }
      setCheckingAgency(false);
    });

    return () => unsubscribeAgency();
  }, [isConnected, address]);

  // ✅ Listen to pending requests live
  const listenToRequests = (state: string) => {
    const q = query(
      collection(db, "verificationRequests"),
      where("state", "==", state),
      where("isVerified", "==", false) // show only pending
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setPendingRequests(data);

      const initialPrices: { [key: string]: string } = {};
      data.forEach((req) => (initialPrices[req.id] = ""));
      setAppraisalPrices(initialPrices);

      console.log(`📝 Pending verificationRequests snapshot:`, data);
    });
  };


  // ✅ Contract + Firestore update
  const verifyAndAppraise = async (req: any) => {
    if (!walletClient || !publicClient) return alert("Wallet client or public client not connected");

    const priceUSDT = appraisalPrices[req.id];
    if (!priceUSDT || isNaN(Number(priceUSDT))) return alert("Enter a valid appraisal price");

    try {
      setLoadingTokens(prev => ({ ...prev, [req.id]: true }));

      const priceWithDecimals = BigInt(Number(priceUSDT) * 10 ** 6);

      // Send transaction
      const txHash = await walletClient.writeContract({
        address: LAND_VERIFIER_ADDRESS,
        abi: LandVerifierABI,
        functionName: "verifyAndAppraise",
        args: [req.tokenId, priceWithDecimals],
      });

      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // ✅ Update only isVerified
      await updateDoc(doc(db, "verificationRequests", req.id), {
        isVerified: true,
        appraised: true,
        appraisalPriceUSDT: Number(priceUSDT),
        verifiedAt: new Date(),
      });

      // Remove the card from dashboard
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      alert("✅ Verification & Appraisal completed!");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoadingTokens(prev => ({ ...prev, [req.id]: false }));
    }
  };




  if (checkingAgency) return <p className="p-6">Checking agency approval...</p>;
  if (!isApprovedAgency)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">
          ❌ You are not an approved agency for this wallet.
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Agency Dashboard – {agencyState}</h1>

      {pendingRequests.length === 0 && (
        <p className="text-gray-500">No pending verification requests in your state.</p>
      )}

      <div className="grid gap-4">
        {pendingRequests.map((req) => (
          <div key={req.id} className="border border-gray-300 rounded-lg p-4 shadow-sm">
            <p><strong>Token ID:</strong> {req.tokenId}</p>
            <p><strong>User Purchase Price:</strong> {req.purchasePrice || "USDT"}</p>
            <p><strong>User State:</strong> {req.state}</p>

            <div className="flex flex-wrap mt-4 gap-2 items-center">
              {/* Metadata Button */}
              <a
                href={req.metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                View Metadata
              </a>

              {/* Explorer Button */}
              <a
                href={`https://scan.test2.btcs.network/nft/0xedbc3fec50826c078b53e13b4aa0724e41491936/${req.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                View on Explorer
              </a>

              {/* Appraisal Input */}
              <input
                type="number"
                placeholder="Appraisal Price (e.g., 1000 USDT)"
                value={appraisalPrices[req.id]}
                onChange={(e) =>
                  setAppraisalPrices({ ...appraisalPrices, [req.id]: e.target.value })
                }
                className="border px-3 py-2 rounded w-32"
              />

              {/* Verify Button */}
              <button
                onClick={() => verifyAndAppraise(req)}
                disabled={loadingTokens[req.id]}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                {loadingTokens[req.id] ? "Processing..." : "Verify & Appraise"}
              </button>

            </div>
          </div>


        ))}
      </div>
    </div>
  );
}