"use client";

import React, { useEffect, useState } from "react";
import LandCard from "../../components/LandCard";
import LandModal from "../../components/LandModal";
import { normalizeIPFS } from "../../lib/ipfs";

const MAX_TOKENS = 20; // can replace with dynamic `balanceOf`

export default function MyNFTs() {
  const [nfts, setNfts] = useState<any[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  useEffect(() => {
    fetchNFTs();
  }, []);

  async function fetchNFTs() {
    const results: any[] = [];
    for (let id = 1; id <= MAX_TOKENS; id++) {
      try {
        const res = await fetch(`/api/nft-check?account=0xBd03b4D42671349d5fc37feA7e1509f86887F9D8&tokenId=${id}`);
        const data = await res.json();
        if (data.owned) {
          const metaRes = await fetch(normalizeIPFS(data.tokenURI));
          const metadata = await metaRes.json();
          results.push({
            id,
            metadata,
            verified: data.verified,
            verifyingAgency: data.verifyingAgency,
            verificationFee: data.verificationFee
          });
        }
      } catch (e) {
        console.error(`Error fetching token ${id}`, e);
      }
    }
    setNfts(results);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Land NFTs</h1>
      {nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <LandCard
              key={nft.id}
              nft={nft}
              onClick={() => setSelectedNFT(nft)}
              onVerify={() => alert(`Verifying NFT ${nft.id}...`)}
            />
          ))}
        </div>
      )}

      {selectedNFT && (
        <LandModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}
    </div>
  );
}
