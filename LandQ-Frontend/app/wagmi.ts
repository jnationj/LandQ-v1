import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

// Core Blockchain Testnet2 configuration
export const core_testnet2: Chain = {
  id: 1114,
  name: 'Core Blockchain Testnet2',
  nativeCurrency: {
    decimals: 18,
    name: 'tCORE2',
    symbol: 'tCORE2',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test2.btcs.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Core Testnet2 Explorer',
      url: 'https://scan.test2.btcs.network',
    },
  },
  testnet: true,
};

export const core_mainnet: Chain = {
  id: 1116,
  name: 'Core Blockchain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CORE',
    symbol: 'CORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.coredao.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Routescan Explorer',
      url: 'https://scan.coredao.org/',
    },
  },
  testnet: false,
};



export const config = getDefaultConfig({
  appName: 'LandNFT',
  projectId: '505f3f0ffe9fc46644eb8977fe3e43df', // Placeholder project ID
  chains: [core_testnet2, core_mainnet],
  ssr: true,
});