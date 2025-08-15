interface LandCardProps {
  nft: {
    id: number;
    metadata: any;
    isVerified: boolean; // ✅ instead of 'verified'
    verifyingAgency: string;
    verificationFee: string;
    tokenId: string;
    metadataUrl: string;
    image: string;
  };
  onClick: () => void;
  onVerify: () => void;
}

export default function LandCard({ nft, onClick, onVerify }: LandCardProps) {
  if (nft.isVerified) {
    return null; // ✅ Don't even render verified NFTs
  }

  return (
    <div
      className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      <img
        src={nft.metadata?.image || "/placeholder.png"}
        alt={nft.metadata?.name || "Land NFT"}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="text-lg font-semibold mt-2">{nft.metadata?.name}</h3>
      <p className="text-sm text-gray-600">
        {nft.metadata?.description || "No description"}
      </p>
      <p className="mt-1">
        <strong>State:</strong> {nft.metadata?.state || "Unknown"}
      </p>
      <p className="mt-1">
        <strong>Verified:</strong> {nft.isVerified ? "✅ Yes" : "❌ No"}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onVerify();
        }}
        className="mt-2 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
      >
        Verify NFT
      </button>
    </div>
  );
}
