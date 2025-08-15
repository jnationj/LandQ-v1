import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient"; // adjust if firebase config path is different

// const db = getFirestore(app);

export async function saveVerificationData({ tokenId, metadataUrl, image, state, walletAddress }: { tokenId: string; metadataUrl: string; image: string; state: string; walletAddress: string; }) {
  try {
    await addDoc(collection(db, "verificationRequests"), {
      tokenId,
      metadataUrl,
      image,
      state,
      walletAddress,
      isVerified: false,
      verifyingAgency: "",
      createdAt: serverTimestamp(),
    });
    console.log("✅ Verification request saved to Firebase");
  } catch (error) {
    console.error("❌ Error saving verification request:", error);
  }
}
