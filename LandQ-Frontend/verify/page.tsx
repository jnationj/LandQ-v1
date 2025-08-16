'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebaseClient'
import { collection, getDocs } from 'firebase/firestore'
import axios from 'axios'
import { AgencyReviewCard } from '@/components/AgencyReviewCard'

export default function VerifyPage() {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'verificationRequests'))
        const list = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()

            // convert IPFS to HTTP gateway
            const ipfsUrl = data.metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
            const meta = await axios.get(ipfsUrl).then((res) => res.data)

            return {
              id: doc.id,
              tokenId: data.tokenId,
              requestedBy: data.requestedBy,
              requestedAt: data.requestedAt?.seconds ?? 0,
              metadataUri: data.metadataUri,
              metadata: meta, // include full metadata for agency to review
            }
          })
        )

        // sort by most recent
        list.sort((a, b) => b.requestedAt - a.requestedAt)

        setRequests(list)
      } catch (error) {
        console.error('Failed to fetch verification requests:', error)
      }
    }

    fetchRequests()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Pending Land Verifications</h1>

      {requests.length === 0 ? (
        <p>No verification requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <AgencyReviewCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}
