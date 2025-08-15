// components/Features.tsx
'use client';

import { CheckCircle } from 'lucide-react';

const features = [
  {
    title: 'Tokenized African Land',
    description: 'Buy, verify, and trade real land on-chain across Africa, represented as dynamic NFTs.',
  },
  {
    title: 'Land-Backed Loans',
    description: 'Access low-interest crypto loans using your land NFT as collateral with BTC or USDT.',
  },
  {
    title: 'BTCFi Integration',
    description: 'Earn, borrow or invest in land markets with Bitcoin-powered financial strategies.',
  },
  {
    title: 'DeFi + Land Investing',
    description: 'Stake, lend, and earn yields on tokenized land assets via our decentralized platform.',
  },
];

export default function Features() {
  return (
    <section className="bg-[#f9fafb] py-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          What Makes Us Different?
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Combining African land, NFTs, and Bitcoin-backed finance into one easy-to-use Web3 platform.
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <CheckCircle className="text-green-600 w-6 h-6 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">{feat.title}</h3>
              </div>
              <p className="text-gray-600">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
