'use client';

import { Button } from "@/components/ui/button";
import ImageCarousel from './ImageCarousel';
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-white py-20 px-6 lg:px-16 overflow-hidden">
      
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url('/assets/lagos-transparent-bg.png')",
          opacity: 0.19,
          zIndex: 0,
        }}
      ></div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between">
        
        {/* Text Content */}
        <div className="text-center md:text-left md:max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Own African Land <br className="hidden sm:block" />
            <span className="text-green-600">On-Chain</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Tokenize land, access crypto loans, and build wealth using your land as a real-world asset.
            Experience the future of African property with NFTs and Bitcoin-backed DeFi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/my-nfts">
              <Button className="text-lg px-6 py-4 bg-green-600 hover:bg-green-700">
                Explore Land NFTs
              </Button>
            </Link>
            <Link href="/mint">
              <Button variant="outline" className="text-lg px-6 py-4">
                Mint Your Land
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <ImageCarousel />
        </div>
      </div>
    </section>
  );
}
