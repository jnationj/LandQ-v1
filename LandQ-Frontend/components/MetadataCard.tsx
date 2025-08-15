// components/MetadataCard.tsx
'use client';

export default function MetadataCard({ url }: { url: string }) {
  return (
    <div className="mt-6 border rounded p-4 bg-gray-50">
      <h2 className="text-lg font-semibold">Metadata URL:</h2>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        {url}
      </a>
    </div>
  );
}