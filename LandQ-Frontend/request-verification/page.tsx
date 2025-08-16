'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { db } from '@/lib/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LAND_VERIFIER_ADDRESS } from '@/lib/constants';
import LandVerifier from '../../abi/LandVerifier_ABI.json';
import { readContract, writeContract } from '@wagmi/core';
import { toast } from 'react-hot-toast';

export default function RequestVerificationPage() {
  const { address: userAddress } = useAccount();
  const [tokenId, setTokenId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userAddress) {
      toast.error('Connect your wallet first');
      return;
    }

    if (!tokenId) {
      toast.error('Enter a token ID');
      return;
    }

    try {
      setSubmitting(true);
      setSuccess(false);

      const tokenIdNum = BigInt(tokenId);

      // 1. Check if already requested
      const existing = await getDoc(doc(db, 'verificationRequests', tokenId));
      if (existing.exists()) {
        toast.error('Verification already requested for this land');
        return;
      }

      // 2. Fetch metadata
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${tokenId}`; // or use correct URI logic
      const res = await fetch(metadataUri);
      const metadata = await res.json();
      const state = metadata.state;

      if (!state) {
        toast.error('State not found in metadata');
        return;
      }

      // 3. Get agency address
      const agencyAddress = await readContract({
        address: LAND_VERIFIER_ADDRESS,
        abi: LandVerifier,
        functionName: 'getAgencyForLocation',
        args: [state],
      }) as `0x${string}`;

      if (!agencyAddress || agencyAddress === '0x0000000000000000000000000000000000000000') {
        toast.error(`No agency registered for ${state}`);
        return;
      }

      // 4. Get fee
      const fee = await readContract({
        address: LAND_VERIFIER_ADDRESS,
        abi: LandVerifier,
        functionName: 'getVerificationFee',
        args: [agencyAddress],
      }) as bigint;

      // 5. Call requestVerification and pay fee
      const { hash } = await writeContract({
        address: LAND_VERIFIER_ADDRESS,
        abi: LandVerifier,
        functionName: 'requestVerification',
        args: [tokenIdNum],
        value: fee,
      });

      setTxHash(hash);
      toast.success('Verification request sent!');

      // 6. Save to Firestore
      await setDoc(doc(db, 'verificationRequests', tokenId), {
        tokenId: tokenIdNum.toString(),
        user: userAddress,
        state,
        metadataUri,
        agency: agencyAddress,
        fee: fee.toString(),
        requestedAt: Date.now(),
        status: 'pending',
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to request verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Request Land Verification</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        {submitting ? 'Submitting...' : 'Submit Verification Request'}
      </button>
      {success && (
        <div className="mt-4 text-green-600">
          ✅ Request submitted!
          {txHash && (
            <p className="text-sm">
              <a
                href={`https://scan.test2.btcs.network/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View Transaction
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}