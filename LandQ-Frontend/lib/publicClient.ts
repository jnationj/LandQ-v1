// lib/publicClient.ts
import { createPublicClient, http } from 'viem';
import { config } from '../app/wagmi'; // Adjust this path to wherever you define your config

export const getPublicClient = (chainId: number) => {
  const chain = config.chains.find((c) => c.id === chainId);
  if (!chain) throw new Error(`Chain with ID ${chainId} not found`);

  return createPublicClient({
    chain,
    transport: http(),
  });
};
