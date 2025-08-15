'use client';

import { useState } from 'react';
import MintButton from './MintButton';

export default function ManualMint() {
  const [metadataUri, setMetadataUri] = useState('');

  const isValidIpfsUri = (uri: string) => uri.startsWith('ipfs://') && uri.length > 20;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Paste Metadata URI to Mint NFT</h2>

      <input
        type="text"
        value={metadataUri}
        onChange={(e) => setMetadataUri(e.target.value)}
        placeholder="ipfs://..."
        className="w-full border border-gray-300 p-3 rounded mb-4"
      />

      {isValidIpfsUri(metadataUri) ? (
        <>
          <p className="text-sm text-gray-700 mb-2">
            Metadata Link:{' '}
            <a
              href={`https://gateway.pinata.cloud/ipfs/${metadataUri.replace('ipfs://', '')}`}
              target="_blank"
              className="text-blue-600 underline"
            >
              View Metadata
            </a>
          </p>

          <MintButton metadataUrl={metadataUri} />
        </>
      ) : (
        <p className="text-sm text-red-500">Enter a valid `ipfs://...` URI to mint.</p>
      )}
    </div>
  );
}
