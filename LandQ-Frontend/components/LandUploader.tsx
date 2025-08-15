'use client';

import { useState } from 'react';
import MintButton from './MintButton';

export default function LandUploader() {
  const [metadataUri, setMetadataUri] = useState('');
  const [manualUri, setManualUri] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    coordinates: '',
    landDocument: null as File | null,
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === 'landDocument') {
      setForm({ ...form, landDocument: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('coordinates', form.coordinates); // e.g. [[6.1,3.2],[6.1,3.1],[6.2,3.1],[6.2,3.2]]
      if (form.landDocument) {
        formData.append('landDocument', form.landDocument);
      }

      const res = await fetch('http://localhost:4000/create-land-dnft', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.metadataUri) {
        setMetadataUri(data.metadataUri);
      } else {
        alert('No metadata URI returned.');
      }
    } catch (err) {
      alert('Error uploading data.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h2 className="text-xl font-bold mb-4">Upload Land Details</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Land Name" onChange={handleChange} className="w-full border p-2 mb-2" />
        <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border p-2 mb-2" />
        <input type="text" name="price" placeholder="Price (USD)" onChange={handleChange} className="w-full border p-2 mb-2" />
        <textarea
          name="coordinates"
          placeholder='Coordinates (e.g. [[6.42,3.43],[6.42,3.43],[6.42,3.43],[6.42,3.43]])'
          onChange={handleChange}
          className="w-full border p-2 mb-2"
        />
        <input type="file" name="landDocument" accept=".pdf,.png,.jpg" onChange={handleChange} className="w-full border p-2 mb-2" />
        <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {uploading ? 'Uploading...' : 'Upload and Generate Metadata'}
        </button>
      </form>

      {metadataUri && (
        <div className="mt-6 p-4 border rounded bg-green-50">
          <p className="text-sm text-gray-800">✅ Metadata URI:</p>
          <a href={`https://gateway.pinata.cloud/ipfs/${metadataUri.split('ipfs://')[1]}`} target="_blank" className="text-blue-700 underline">
            {metadataUri}
          </a>

          {/* Mint Button Appears after Upload */}
          <MintButton metadataUrl={metadataUri} />
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <p className="font-semibold mb-2">Or paste a metadata URL manually:</p>
        <input
          type="text"
          value={manualUri}
          onChange={(e) => setManualUri(e.target.value)}
          placeholder="ipfs://..."
          className="w-full border p-2 mb-2"
        />
        {manualUri && <MintButton metadataUrl={manualUri} />}
      </div>
    </div>
  );
}