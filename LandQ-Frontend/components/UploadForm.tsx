'use client';

import { useEffect, useState } from 'react';

interface UploadFormProps {
  onSuccess?: (uri: string) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [statesList, setStatesList] = useState<string[]>([]);
  const [metadataUri, setMetadataUri] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
        const data = await res.json();
        const countryNames = data.data.map((c: any) => c.name);
        setCountriesList(countryNames);
      } catch (err) {
        console.error('Error fetching countries', err);
        setError('Failed to fetch countries list');
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setState('');
    setStatesList([]);

    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry }),
      });

      const data = await res.json();
      const states = data.data?.states.map((s: any) => s.name) || [];
      setStatesList(states);
    } catch (err) {
      console.error('Error fetching states', err);
      setError('Failed to fetch states for selected country');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMetadataUri('');

    /* if (!file) {
      setError('Please upload a land document.');
      return;
    } */

    let parsedCoords;
    try {
      parsedCoords = JSON.parse(coordinates);
      if (!Array.isArray(parsedCoords)) {
        throw new Error('Coordinates must be a valid array');
      }
      // Optional: remove fixed length check if you want flexible polygons
      // if (parsedCoords.length < 3) {
      //   throw new Error('Coordinates must have at least 3 points');
      // }
    } catch (err) {
      setError('Invalid coordinates JSON format.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('coordinates', coordinates);
    formData.append('country', country);
    formData.append('state', state);
    
    if (file) {
      formData.append('landDocument', file);
    }

    console.log('Uploading with form data:', {
      name,
      description,
      price,
      coordinates,
      country,
      state,
      fileName: file?.name,
    });

    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/create-land-dnft', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const data = await res.json();
      const uri = data.metadataUri || data.gateway?.metadata;
      if (!uri) throw new Error('No metadata URI returned');

      setMetadataUri(uri);

      if (onSuccess) onSuccess(uri);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">Upload Land Metadata</h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Price in USD"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border p-2 w-full"
        />

        <select
          value={country}
          onChange={handleCountryChange}
          required
          className="border p-2 w-full"
        >
          <option value="">Select Country</option>
          {countriesList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          disabled={!statesList.length}
          className="border p-2 w-full"
        >
          <option value="">Select State</option>
          {statesList.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        Land Coordinates
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <input
              key={i}
              type="text"
              placeholder="6.563786, 3.300597"
              onChange={(e) => {
                const newCoords = Array(4).fill(null).map(() => [null, null]);
                try {
                  // Keep existing parsed coordinates if valid
                  const parsed = JSON.parse(coordinates);
                  if (Array.isArray(parsed) && parsed.length === 4) {
                    for (let j = 0; j < 4; j++) {
                      if (Array.isArray(parsed[j]) && parsed[j].length === 2) {
                        newCoords[j] = parsed[j];
                      }
                    }
                  }
                } catch {}

                const [lat, lng] = e.target.value
                  .split(",")
                  .map((v) => parseFloat(v.trim()));

                newCoords[i] = [lat, lng];
                setCoordinates(JSON.stringify(newCoords));
              }}
              className="border p-2 w-full font-mono text-sm placeholder-gray-400"
            />
          ))}
        </div>





        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          {loading ? 'Uploading...' : 'Upload & Generate Metadata'}
        </button>
      </form>

      {metadataUri && (
        <div className="bg-green-50 border border-green-300 p-4 rounded">
          <p className="text-green-700 font-semibold">✅ Metadata URI:</p>
          <p className="break-all text-sm mb-2">{metadataUri}</p>
          <p className="text-green-700 font-semibold">🌐 Gateway:</p>
          <a
            href={metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline break-all text-sm"
          >
            {metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
          </a>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-100 border border-red-300 p-3 rounded">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
