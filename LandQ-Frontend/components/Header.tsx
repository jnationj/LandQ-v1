'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { isConnected, address } = useAccount();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-black text-white shadow-md">
      <Link href="/" className="flex items-center gap-2">
        {/* Logo in a circle */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src='/logo.png'
            alt="LandQ Logo"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        {/* Optional: keep brand text beside it */}
        {/* <span className="text-xl font-semibold">LandVault</span> */}
      </Link>

      <div className="flex items-center space-x-4">

        <ConnectButton />
      </div>
    </header>
  );
}