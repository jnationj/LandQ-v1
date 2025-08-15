import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseClient';

export async function saveMintToFirebase({
  name,
  coordinates,
  metadataUri,
  imageUrl,
  tokenId,
  walletAddress,
  contractAddress
}: {
  name: string;
  coordinates: string[][];
  metadataUri: string;
  imageUrl: string;
  tokenId: number;
  walletAddress: string;
  contractAddress: string;
}) {
  const openseaUrl = `https://scan.test2.btcs.network/nft/2/${contractAddress}/${tokenId}`;
  await addDoc(collection(db, 'landNFTs'), {
    name,
    coordinates: coordinates.map(c => c.join(',')), // ✅ fixed
    metadataUri,
    imageUrl,
    tokenId,
    walletAddress,
    openseaUrl,
    createdAt: new Date().toISOString()
  });
}