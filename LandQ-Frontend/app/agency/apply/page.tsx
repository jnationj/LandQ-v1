"use client";
import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { db } from "../../../lib/firebaseClient";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { LAND_VERIFIER_ADDRESS } from "@/lib/constants";
import LandVerifierABI from "../../../abi/LandVerifier_ABI.json";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { readContract } from 'wagmi/actions'

export default function AgencyApplicationForm() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const router = useRouter();

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [regionTaken, setRegionTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);


  // Fetch countries
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries")
      .then((res) => res.json())
      .then((data) => setCountries(data.data.map((c: any) => c.country)))
      .catch(console.error);
  }, []);

  // Fetch states for selected country
  useEffect(() => {
    if (country) {
      fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      })
        .then((res) => res.json())
        .then((data) => setStates(data.data.states.map((s: any) => s.name)))
        .catch(console.error);
    } else {
      setStates([]);
    }
  }, [country]);

  // Check if wallet already applied (Firestore)
  useEffect(() => {
    async function checkWallet() {
      if (!isConnected || !address) return;
      const q = query(
        collection(db, "agencyApplications"),
        where("wallet", "==", address)
      );
      const snap = await getDocs(q);
      setAlreadyApplied(!snap.empty);
      setLoading(false);
    }
    checkWallet();
  }, [address, isConnected]);

  // Live check region availability
  useEffect(() => {
    async function checkRegion() {
      if (!country || !state) {
        setRegionTaken(false);
        return;
      }
      const q = query(
        collection(db, "agencyApplications"),
        where("country", "==", country),
        where("state", "==", state)
      );
      const snap = await getDocs(q);
      setRegionTaken(!snap.empty);
    }
    checkRegion();
  }, [country, state]);

  // ✅ Contract check on load using Firestore state
  useEffect(() => {
    async function checkAgencyOnChain() {
      if (!isConnected || !address) return;

      try {
        // 1️⃣ Get the user's state from Firestore
        const q = query(
          collection(db, "agencyApplications"),
          where("wallet", "==", address)
        );
        const snap = await getDocs(q);
        if (snap.empty) return; // No application found → skip

        const userState = snap.docs[0].data().state;
        if (!userState) return;

        // 2️⃣ Encode state to bytes32
        const stateBytes = ethers.encodeBytes32String(userState);

        // 3️⃣ Call contract
        const contract = new ethers.Contract(
          LAND_VERIFIER_ADDRESS,
          LandVerifierABI,
          publicClient
        );

        const [agencyAddress] = await contract.getAgency(stateBytes);

        // 4️⃣ Compare
        if (
          agencyAddress &&
          agencyAddress.toLowerCase() === address.toLowerCase()
        ) {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Error checking agency from contract:", err);
      }
    }

    checkAgencyOnChain();
  }, [isConnected, address, publicClient, router]);


  // ✅ Contract check on load using Firestore state
  useEffect(() => {
    async function checkAgencyOnChain() {
      if (!isConnected || !address) return;

      try {
        // 1️⃣ Get the user's state from Firestore
        const q = query(
          collection(db, "agencyApplications"),
          where("wallet", "==", address)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setLoading(false); // No application → allow form render
          return;
        }

        const userState = snap.docs[0].data().state;
        if (!userState) {
          setLoading(false);
          return;
        }

        // 2️⃣ Encode state to bytes32
        const stateBytes = ethers.encodeBytes32String(userState);

        // 3️⃣ Call contract
        const contract = new ethers.Contract(
          LAND_VERIFIER_ADDRESS,
          LandVerifierABI,
          publicClient
        );

        const [agencyAddress] = await contract.getAgency(stateBytes);

        // 4️⃣ Compare
        if (
          agencyAddress &&
          agencyAddress.toLowerCase() === address.toLowerCase()
        ) {
          router.replace("/dashboard");
          return; // Prevent form rendering
        }

        // 5️⃣ If contract doesn't match, just show the form
        setLoading(false);
      } catch (err) {
        console.error("Error checking agency from contract:", err);
        setLoading(false);
      }
    }

    checkAgencyOnChain();
  }, [isConnected, address, publicClient, router]);


  if (!isConnected) return <p>Please connect your wallet to continue.</p>;
  if (loading) return <p>Checking application status...</p>;
  if (alreadyApplied) return <p>✅ You already submitted your application. Waiting for review.</p>;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      // Parse fee value
      const feeValue = parseFloat(fee);
      if (isNaN(feeValue)) {
        throw new Error("Invalid fee value");
      }

      // Disable submission by setting loading state if needed
      // You can show a loading indicator here if you want

      // Create a new application document in Firestore
      await addDoc(collection(db, "agencyApplications"), {
        wallet: address,
        country,
        state,
        description,
        fee: feeValue,
        createdAt: serverTimestamp(),
      });

      // Indicate success
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      // Optionally, you may want to notify the user about the error.
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4">Apply to Become an Agency</h1>
      {success && <p className="text-green-600">Application submitted!</p>}
      {regionTaken && (
        <p className="text-red-600 mb-2">
          This country/state already has an agency.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Country Selector */}
        <div>
          <label className="block font-medium">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* State Selector */}
        <div>
          <label className="block font-medium">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">
            Why do you want to be a Land Agent for your state?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded"
            rows={4}
            required
          />
        </div>

        {/* Fee */}
        <div>
          <label className="block font-medium">
            Set Agency Fee for your Region (tCORE)
          </label>
          <input
            type="number"
            step="0.001"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block font-medium">Wallet Address</label>
          <input
            type="text"
            value={address || ""}
            disabled
            className="border p-2 w-full rounded bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading || regionTaken}
          className={`px-4 py-2 rounded text-white ${
            regionTaken
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}