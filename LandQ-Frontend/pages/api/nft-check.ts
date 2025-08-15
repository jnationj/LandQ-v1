// /pages/api/checkOwnership.ts

import { createPublicClient, http } from 'viem';
import { core_testnet2 } from '../../app/wagmi'; // 👈 import your defined chain
import { LAND_NFT_ADDRESS } from '@/lib/constants';
import { landNFTAbi } from '@/lib/abi/landNFT';

const client = createPublicClient({
  chain: core_testnet2,
  transport: http(),
});

export default async function handler(req, res) {
  const { account, tokenId } = req.query;

  try {
    const balance = await client.readContract({
      address: LAND_NFT_ADDRESS,
      abi: landNFTAbi,
      functionName: 'balanceOf',
      args: [account, BigInt(tokenId)],
    });

    res.status(200).json({ owns: balance > 0n });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}