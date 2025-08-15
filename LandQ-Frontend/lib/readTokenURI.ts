// lib/readTokenURI.ts
export async function readTokenURI(tokenId: number) {
  try {
    const res = await fetch(`/api/nft-uri?tokenId=${tokenId}`);
    if (!res.ok) throw new Error("Failed to fetch token URI");
    const data = await res.json();
    return data; // { uri: "ipfs://..." } or whatever your API returns
  } catch (err) {
    console.error("Error reading token URI:", err);
    return null;
  }
}
