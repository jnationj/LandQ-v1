// components/FAQ.tsx
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <section className="bg-white py-16 px-6 lg:px-16" id="faq">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <p className="text-gray-600 mb-12">
          Everything you need to know about land NFTs, loans, and our Africa-focused platform.
        </p>

        <Accordion type="single" collapsible className="space-y-4 text-left">

          <AccordionItem value="item-legal">
            <AccordionTrigger>Is this legal?</AccordionTrigger>
            <AccordionContent>
              Yes. We work with licensed professionals and follow land registry regulations in supported African regions. Land NFTs are backed by verifiable ownership records and legal agreements.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-verify">
            <AccordionTrigger>How is land verified?</AccordionTrigger>
            <AccordionContent>
              Each land submission is reviewed using satellite data, registry documents, and GPS polygon mapping. We ensure no overlaps, confirm boundaries, and validate ownership before minting.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-default">
            <AccordionTrigger>What happens in a loan default?</AccordionTrigger>
            <AccordionContent>
              If the borrower fails to repay by the due date, the NFT is transferred to the vault owner. However, a 7-day grace period allows the borrower to reclaim it by paying back the loan plus a penalty.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-1">
            <AccordionTrigger>What is a Land NFT?</AccordionTrigger>
            <AccordionContent>
              A Land NFT is a digital representation of a real plot of land, stored securely on the blockchain. It proves ownership, enables transparent transfers, and allows access to on-chain services like loans.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How can I mint my own land as an NFT?</AccordionTrigger>
            <AccordionContent>
              You can mint land by submitting your GPS coordinates and verifying ownership. Our platform will generate metadata, store it on IPFS, and issue a unique NFT to your wallet.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I use my land NFT to get a loan?</AccordionTrigger>
            <AccordionContent>
              Yes. Our DeFi vault allows you to borrow stablecoins or BTC using your land NFT as collateral. You retain ownership unless you default on the loan after the grace period.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Is this platform focused only on African land?</AccordionTrigger>
            <AccordionContent>
              Our mission is to bring land ownership on-chain across Africa first, where title fraud and transparency are major challenges. Global expansion may come later.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>What blockchain do you use?</AccordionTrigger>
            <AccordionContent>
              We use Ethereum-compatible smart contracts with storage on IPFS. Future support for Hedera, Solana, or Layer 2s may be added as the platform grows.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>How does the AI help with land purchases?</AccordionTrigger>
            <AccordionContent>
              Our AI agent analyzes submitted land coordinates to verify if the land has already been minted, checks for overlap, and ensures ownership validity. This helps prevent double-selling and fraud.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Can the AI tell what’s around a land location?</AccordionTrigger>
            <AccordionContent>
              Yes. The AI scans the area using real-time data from OpenStreetMap to identify nearby amenities like roads, schools, hospitals, and markets. This helps buyers understand the land’s development potential.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Can the AI suggest what the land should be used for?</AccordionTrigger>
            <AccordionContent>
              Absolutely. Based on surrounding infrastructure, the AI can recommend the most optimal land use — for example, farming, estate development, or commercial use — to maximize its value.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>
    </section>
  );
}