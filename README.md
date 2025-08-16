# **LandQ**

A Next.js + Web3 frontend for **LandNFT**, **LandVerifier**, and **LandLending** — enabling tokenization, verification, and DeFi lending of real-world land assets, with Firebase integration for off-chain storage.

---

## 📑 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Project](#running-the-project)
7. [Testing](#testing)
8. [Folder Structure](#folder-structure)
9. [Usage](#usage)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [License](#license)
13. [Contact](#contact)

---

## 🚀 Features

* **NFT Minting**: Tokenize land assets as ERC-1155 NFTs.
* **Verification System**: Validate asset ownership via LandVerifier smart contract.
* **DeFi Lending**: Use NFTs as collateral for loans with LandLending.
* **Firebase Integration**: Store verification metadata and user requests off-chain.
* **Responsive UI**: Tailored for desktop and mobile devices.
* **Wallet Connection**: Supports MetaMask and WalletConnect.

---

## 🛠 Tech Stack

* **Frontend**: Next.js 15, React 18, TypeScript
* **Styling**: TailwindCSS
* **Blockchain**: ethers.js / wagmi
* **Smart Contracts**: LandNFT, LandVerifier, LandLending (Solidity)
* **Database**: Firebase Firestore


---

## 📋 Prerequisites

* **Node.js** v18+
* **npm** v9+ or **yarn** v1.22+
* MetaMask or another Web3 wallet
* Access to Ethereum or compatible testnet (core testnet2)
* Firebase project with Firestore enabled

---

## 📦 Installation
## Frontend

```bash
# Clone repository
git clone https://github.com/jnationj/LandQ-v1.git
cd LandQ-Frontend

# Install dependencies
npm install
# or
yarn install
```

---

## ⚙️ Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_LANDNFT_CONTRACT=your_contract_address
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID
# === FIREBASE ADMIN SDK CONFIG ===
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## ▶️ Running the Project

**Development:**

```bash
npm run dev
# or
yarn dev
```

## Backend

```bash
# Change directory
cd LandQ-Backend

# Install dependencies
npm install
# or
yarn install
```

---

## ⚙️ Configuration

Create a `.env.local` file in the root directory:

```env
PINATA_JWT=
```
---

## ▶️ Running the Project

**Development:**

```bash
npm run dev
# or
yarn dev
```

## AI-Agent

```bash
# Change directory

cd LandQ-ai-agent

# Install dependencies
pnpm install

```

---

## ⚙️ Configuration

Create a `.env.local` file in the root directory:

```env
API_BASE_URL=http://127.0.0.1:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
```

---

## ▶️ Running the Project

# Start ollama on local machine

```
ollama serve
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b

```

**Development:**

```bash
pnpm run dev
```


---

## 📂 Frontend Folder Structure

```
├── app/                   # Next.js App Router pages
├── components/            # UI components (Chat, UploadForm, etc.)
├── lib/                   # Firebase & blockchain helper functions
├── public/                # Static assets
├── styles/                # TailwindCSS styles
└── abi/                   # Smart contract ABIs
and more ...
```

---

## 💡 Usage

1. Connect your Web3 wallet.
2. Mint a LandNFT by providing asset metadata.
3. Verify ownership via LandVerifier.
4. Use the NFT as collateral in LandLending.

---

## **LandNFT Detailed Usage Flow**

---

### **Stage 1 – Become an Accredited Land Verifier**

To ensure authenticity of land NFTs, verification is handled by **approved agencies** per state/region.

**Steps:**

1. **Apply as an Agency** – `/agency/apply`

   * User fills form with:

     * State/Region
     * Why you want to be an agency in your region
     * Set verification fee - goes to agency address
     * Address auto populated
   * Application is reviewed by admin. if not review on time  [Contact](#contact)
# or

* use this private key for Nigeria "Yobe Stat"e 9bcb1e72326e6179069ddb4c7ba0c91d6c0ec6a7bbb1c9b93a642ec0508cc9f1


2. **Approval ** /agency/dashboard`

   * Once approved, the agency receives an right that grants them access to verify land NFTs in their jurisdiction.

---

### **Stage 2 – Mint Your Land NFT**

Once a user owns land, they can **tokenize** it on the blockchain using **LandNFT**.

**Steps:**

1. Go to `/mint`
2. Fill in:

   * Land Details
   * Land coordinates (latitude & longitude)
   * price
   * Supporting documents (upload pdfs files/images)
3.Generates Metadata URL from Pinata
4. No of plots which serves as the FT in erc1155
5. Mint transaction is sent to the blockchain.
6. The minted NFT is **unverified** initially.

---

### **Stage 3 – Request Land Verification**

To make the NFT official and tradable, it must be verified by the state agency.

**Steps:**

1. Owner sends `/my-nfts` request verify

2. Agency reviews:
   * Blockchain NFT data
   * Uploaded documents
   * Government land registry records
3. If approved:

   * `isVerified` flag on NFT metadata is set to **true** (on-chain + Firebase off-chain record updated).
---

### **Stage 4 – Collect Loan with verified Land NFT**

After verification:

* NFT can be **used** collect loan in USDT from the contract LandLending.

---

### **Stage 5 – Use Land as Collateral (DeFi Integration)**

With **LandLending**, users can borrow against their verified land NFT.

**Steps:**

1. Navigate to `/my-nfts`
2. Choose:
   * Loan amount
   * Interest rate
   * Duration
3. Smart contract locks NFT in escrow.
4. Borrower receives stablecoins mUSDT.
5. On repayment you can either pay with BTC at a discount or USDT, NFT is released.

---

### **Stage 6 – Firebase Off-chain Sync**

Every action updates Firebase for:

* Fast frontend queries
* Off-chain analytics for AI-Agent
* Backup verification trail

---

### **Stage 7 – Coming soon Dispute or Revocation**

If disputes arise (e.g., fraudulent claim):

* `/verification/dispute` can be filed.
* Agency or admin can **revoke verification** and mark NFT as disputed.

---

## 🛠 Troubleshooting

* **"Module not found" error** → Check if all components exist in `components/` and imports use correct case.
* **Firebase errors** → Verify `.env.local` matches Firebase project credentials.
* **Contract interaction failed** → Ensure correct network and contract addresses.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📬 Contact

Maintainer: **Your Name**
Email: [0xlandq@gmail.com](mailto:)
Twitter: [@xLandQ](https://twitter.com/0xLandQ)

