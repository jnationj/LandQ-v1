import React from "react";

interface LandModalProps {
  nft: any;
  onClose: () => void;
}

export default function LandModal({ nft, onClose }: LandModalProps) {
  if (!nft) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded max-w-lg w-full">
        <button
          className="text-red-500 float-right"
          onClick={onClose}
        >
          ✖
        </button>
        <img
          src={nft.metadata?.image || "/placeholder.png"}
          alt={nft.metadata?.name || "Land NFT"}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h2 className="text-xl font-bold">{nft.metadata?.name}</h2>
        <p>{nft.metadata?.description}</p>
        <p>
          <strong>State:</strong> {nft.metadata?.state}
        </p>
        <p>
          <strong>Verification Agency:</strong> {nft.verifyingAgency}
        </p>
        <p>
          <strong>Verification Fee:</strong> {nft.verificationFee}
        </p>
      </div>
    </div>
  );
}
