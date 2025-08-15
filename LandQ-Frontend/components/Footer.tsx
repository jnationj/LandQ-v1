// components/Footer.tsx
import { Facebook, Twitter, Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding & Mission */}
        <div>
          <h3 className="text-xl font-bold">LandFi Africa</h3>
          <p className="mt-4 text-sm text-gray-400">
            Bringing Africa’s land on-chain. Own, lend, and grow wealth with verified land NFTs powered by DeFi and Bitcoin.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            <li><a href="#mint" className="hover:text-white">Mint Land</a></li>
            <li><a href="#dashboard" className="hover:text-white">My Land Vault</a></li>
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4 text-gray-300">
            <a href="https://x.com/0xLandQ" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Visit us on X"><Twitter size={20} /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white"><Github size={20} /></a>
            <a href="https://landfi.africa" target="_blank" rel="noopener noreferrer" className="hover:text-white"><Globe size={20} /></a>
          </div>
          <p className="mt-4 text-sm text-gray-400">Email: support@landfi.africa</p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LandFi Africa. All rights reserved.
      </div>
    </footer>
  );
}