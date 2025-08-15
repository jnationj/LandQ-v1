// components/MetadataPreview.tsx
'use client';

import { useEffect, useState } from 'react';

export default function MetadataPreview({ metadataUrl }: { metadataUrl: string }) {
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(metadataUrl);
        const data = await res.json();
        setMetadata(data);
      } catch (err) {
        setError('Failed to load metadata');
      }
    };
    fetchMetadata();
  }, [metadataUrl]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!metadata) return <p className="text-gray-500">Loading metadata preview...</p>;

  const imageUrl = metadata.image?.startsWith('ipfs://')
    ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
    : metadata.image;

  return (
    <div className="mt-4 border rounded p-4 bg-white shadow">
      <h2 className="text-xl font-semibold mb-2">Metadata Preview</h2>
      <p><strong>Name:</strong> {metadata.name}</p>
      <p><strong>Description:</strong> {metadata.description}</p>
      {imageUrl && (
        <img src={imageUrl} alt="Land Snapshot" className="mt-4 rounded w-full max-h-96 object-contain border" />
      )}
    </div>
  );
}