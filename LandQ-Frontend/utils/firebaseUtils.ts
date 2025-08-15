import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseClient"; // your firebase init file

// const db = getFirestore(app);

/**
 * Save verification request data to Firebase
 * @param {object} data
 * @param {string} data.tokenId - NFT Token ID
 * @param {string} data.metadataUrl - IPFS/HTTP metadata URL
 * @param {string} data.image - Image URL from metadata
 * @param {string} data.state - State of the land
 * @param {string} data.walletAddress - Wallet that submitted the request
 */
export async function saveVerificationData({
  tokenId,
  metadataUrl,
  image,
  state,
  walletAddress
}: {
  tokenId: string;
  metadataUrl: string;
  image: string;
  state: string;
  walletAddress: string;
}) {
  try {
    await addDoc(collection(db, "verificationRequests"), {
      tokenId,
      metadataUrl,
      image,
      state,
      walletAddress,
      isVerified: false, // ✅ Initially not verified
      createdAt: serverTimestamp()
    });
    console.log("✅ Verification request saved to Firebase");
  } catch (error) {
    console.error("❌ Error saving verification request:", error);
    throw error;
  }
}