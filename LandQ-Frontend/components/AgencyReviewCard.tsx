import { useContractRead, useContractWrite } from 'wagmi'
import { LAND_VERIFIER_ADDRESS } from '@/lib/constants'
import LandVerifier from '../abi/LandVerifier_ABI.json'
import { formatEther } from 'viem'
import { useState } from 'react'

export function AgencyReviewCard({ request }: { request: any }) {
  const [loading, setLoading] = useState(false)

  const { data: statusData } = useContractRead({
    address: LAND_VERIFIER_ADDRESS,
    abi: LandVerifier,
    functionName: 'getVerificationStatus',
    args: [BigInt(request.tokenId)],
  })

  const location = request.metadata.state || 'N/A'

  const { data: agencyData } = useContractRead({
    address: LAND_VERIFIER_ADDRESS,
    abi: LandVerifier,
    functionName: 'getAgencyForLocation',
    args: [location],
  })

  const { writeAsync } = useContractWrite({
    address: LAND_VERIFIER_ADDRESS,
    abi: LandVerifier,
    functionName: 'verifyLandNFT',
  })

  const handleVerify = async () => {
    setLoading(true)
    try {
      await writeAsync({ args: [BigInt(request.tokenId)] })
      alert('Verified!')
    } catch (err) {
      console.error(err)
      alert('Failed to verify')
    } finally {
      setLoading(false)
    }
  }

  const status = statusData?.[1]
  const verifiedAt = statusData?.[2]
    ? new Date(Number(statusData[2]) * 1000).toLocaleString()
    : null

  const feeEth = agencyData?.[1] ? formatEther(agencyData[1]) : '...'

  return (
    <div className="border rounded-xl p-4 mb-4 shadow bg-white">
      <h2 className="text-xl font-bold">{request.metadata.name}</h2>
      <p>{request.metadata.description}</p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Status:</strong> {status ? '✅ Verified' : '⏳ Pending'}</p>
      <p><strong>Verification Fee:</strong> {feeEth} ETH</p>
      <p><strong>Submitted by:</strong> {request.requestedBy}</p>
      <p><strong>Submitted at:</strong> {new Date(request.requestedAt * 1000).toLocaleString()}</p>
      {verifiedAt && <p><strong>Verified At:</strong> {verifiedAt}</p>}
      <br />
      {request.metadataUri && (
        <p>
        <button>
            <strong>Metadata URI:</strong>{' '}
            <a
            href={request.metadataUri}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-600"
            >
            View Metadata
            </a>
        </button>
        </p>
      )}
    
      {!status && (
        <button
          onClick={handleVerify}
          disabled={loading}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? 'Verifying...' : 'Approve & Verify'}
        </button>
      )}
    </div>
  )
}