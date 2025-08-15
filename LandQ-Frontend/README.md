# 🌍 Land-Chain Frontend

> A decentralized dApp frontend for tokenizing real-world land ownership using IPFS, Chainlink Functions, and ERC-1155 NFTs.

---

## 📦 Tech Stack

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/docs)
* **Wallet & Web3**: `ethers.js`, `wagmi`, or `RainbowKit` (configurable)
* **Storage**: IPFS via [Pinata](https://www.pinata.cloud/)
* **Smart Contracts**: `Issuer.sol`, `RealEstateToken.sol` on Avalanche Fuji
* **Chainlink**: For metadata fetch automation

---

## 🧱 Project Structure

```bash
frontend/
├── abi/                        # ABI files (e.g., Issuer.json)
├── components/                # Reusable components (form, preview, mint button)
├── pages/                     # Pages directory (e.g., index.tsx, mint.tsx)
├── public/                    # Static assets
├── styles/                    # Global CSS
├── utils/                     # Helper functions (e.g., wallet utils)
├── .env.local                 # Environment variables
├── README.md                  # This file
└── package.json
```

---

## 🛠️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/land-chain-frontend.git
cd land-chain-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Create Environment Variables

Create a `.env.local` file in the root and add the following:

```env
NEXT_PUBLIC_ISSUER_CONTRACT=0xYourIssuerContractAddress
NEXT_PUBLIC_TOKEN_CONTRACT=0xYourRealEstateTokenAddress
NEXT_PUBLIC_SUBSCRIPTION_ID=1234
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

> Replace values with actual deployed contract addresses and backend endpoint.

---

## 🚀 Running the App

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Features

### ✅ Upload Land Details

* Input name, description, price
* Draw/paste 4 geo-coordinates
* Upload land document (PDF/Image)
* Backend generates snapshot map + metadata on IPFS

### 🔎 Preview Metadata

* View the generated metadata object and gateway URL before minting

### 🪙 Mint NFT

* Connect wallet (MetaMask or injected)
* Call `Issuer.sol.issue()` with metadata URI, to address, amount
* Chainlink Functions fetches metadata and mints NFT

---

## 📁 Important Files

* `components/UploadForm.tsx`: Form to collect land data
* `components/MintButton.tsx`: Button to mint NFT using Issuer contract
* `components/MetadataPreview.tsx`: Optional, shows metadata URL content
* `abi/Issuer.json`: ABI from your hardhat build
* `pages/index.tsx`: Home page
* `pages/mint.tsx`: Minting logic

---

## 🌐 Networks

Ensure you are connected to:

* Avalanche Fuji Testnet (default)
* Update `wagmi` config to support other networks if needed.

---

## 🧱 Contracts

| Contract              | Description                      |
| --------------------- | -------------------------------- |
| `Issuer.sol`          | Chainlink-integrated issuer      |
| `RealEstateToken.sol` | ERC-1155 dNFT with land metadata |

---

## 🐛 Common Errors

| Error                        | Fix                                             |
| ---------------------------- | ----------------------------------------------- |
| `window is not defined`      | Wrap logic in `useEffect` or use `'use client'` |
| `Invalid coordinates JSON`   | Ensure it's a valid array of 4 `[lat, long]`    |
| `Error uploading data`       | Ensure backend is running on correct port       |
| `Contract is not a function` | Double check ABI and signer setup               |


---
