// lib/landVerifier.ts
import { writeContract, readContract } from '@wagmi/core'
import abi  from '@/abi/LandVerifier_ABI.json'
import { config } from '../app/wagmi'

const LAND_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_LAND_VERIFIER_ADDRESS as `0x${string}`

// helper: convert string to bytes32
export function toBytes32(text: string) {
  return `0x${Buffer.from(text.padEnd(32, '\0')).toString('hex')}` as `0x${string}`
}

// --------------- WRITE FUNCTIONS ---------------
export async function setAgency(region: string, agencyAddr: `0x${string}`, fee: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'setAgency',
    args: [toBytes32(region), agencyAddr, fee]
  })
}

export async function changeAgencyFee(region: string, newFee: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'changeAgencyFee',
    args: [toBytes32(region), newFee]
  })
}

export async function requestVerification(tokenId: bigint, fee: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'requestVerification',
    args: [tokenId],
    value: fee
  })
}

export async function verifyAndAppraise(tokenId: bigint, priceUSD: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'verifyAndAppraise',
    args: [tokenId, priceUSD]
  })
}

export async function requestReappraisal(tokenId: bigint, fee: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'requestReappraisal',
    args: [tokenId],
    value: fee
  })
}

export async function updateAppraisal(tokenId: bigint, newPriceUSD: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'updateAppraisal',
    args: [tokenId, newPriceUSD]
  })
}

// --------------- READ FUNCTIONS ---------------
export async function getAgency(region: string) {
  return readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'getAgency',
    args: [toBytes32(region)]
  }) as Promise<[string, bigint]>
}

export async function hasPendingRequest(tokenId: bigint) {
  return readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'hasPendingRequest',
    args: [tokenId]
  }) as Promise<boolean>
}

export async function hasPendingReappraisal(tokenId: bigint) {
  return readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'hasPendingReappraisal',
    args: [tokenId]
  }) as Promise<boolean>
}

export async function getAppraisedPrice(tokenId: bigint) {
  return readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'getAppraisedPrice',
    args: [tokenId]
  }) as Promise<bigint>
}