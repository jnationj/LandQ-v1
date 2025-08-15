'use client';

import Link from "next/link";
import Image from "next/image";

export default function LandingHeader() {
  return (
     <header className="w-full flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        {/* Logo in a circle */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src="/logo.png"
            alt="LandQ Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        {/* Optional: keep brand text beside it */}
        {/* <span className="text-xl font-semibold">LandVault</span> */}
      </Link>
        <nav className="flex items-center gap-12 text-sm font-medium text-gray-700">
          <Link href="/#about" className="hover:underline text-sm font-medium">
            About Us
          </Link>
          <Link href="/faq" className="hover:underline text-sm font-medium">
            FAQ
          </Link>
          <Link href="https://blog.example.com" target="_blank" className="hover:underline text-sm font-medium">
            Blog
          </Link>
          <Link href="https://docs.example.com" target="_blank" className="hover:underline text-sm font-medium">
            Docs
          </Link>
        </nav>
        <Link
        href="/app"
        className="inline-block px-6 py-3 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
        >
        Launch App
        </Link>
    </header>
  );
}
