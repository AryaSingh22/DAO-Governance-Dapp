# 🗳️ Full-Stack DAO Governance Platform

This repository contains a complete **full-stack Decentralized Autonomous Organization (DAO) Governance DApp**. Built as a monorepo, it features both Solidity smart contracts (backend) and a React-based UI (frontend).

> 🚧 This is **Phase 1** of a multi-phase project. It currently focuses on governance token minting and delegation.

---

## 🌟 Features

- 🔐 Connect MetaMask wallet  
- 🪙 Mint test governance tokens  
- 🎯 Delegate voting power  
- 🔎 View account and token details  

---

## 🛠️ Tech Stack

**Backend:**

- Solidity  
- Hardhat  
- OpenZeppelin Contracts  
- Ethers.js  
- TypeScript  

**Frontend:**

- React (with Vite)  
- Tailwind CSS  
- Ethers.js v6  
- TypeScript  

---

## 📁 Monorepo Structure

/
├── contracts/ # Solidity smart contracts
├── ignition/ # Deployment modules
├── dao-frontend/ # Frontend app
│ ├── src/
│ └── package.json
├── hardhat.config.ts # Hardhat configuration
├── .gitignore
└── package.json # Root dependencies

yaml
Copy
Edit

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Node.js v18+](https://nodejs.org/)
- NPM
- [MetaMask](https://metamask.io/)

---

### 📦 Installation

```bash
# Clone the repo
git clone https://github.com/AryaSingh22/DAO-Governance-Dapp.git
cd DAO-Governance-Dapp

# Install root dependencies
npm install

# Install frontend dependencies
cd dao-frontend
npm install
cd ..
⚙️ Start Local Blockchain
npx hardhat node
Leave this terminal running.

📜 Deploy Contracts
In a new terminal:
npx hardhat run ignition/modules/Lock.ts --network localhost
📌 Copy the deployed contract address for frontend configuration.
```

🧩 Configure the Frontend
Open dao-frontend/src/App.tsx

Replace the placeholder contract address with the one you just deployed.

🦊 Configure MetaMask
Add a new custom network in MetaMask:

Network Name: Hardhat Localhost

RPC URL: http://127.0.0.1:8545

Chain ID: 31337

Currency Symbol: ETH

Import the private key of Account #0 from the npx hardhat node output.

▶️ Run the Frontend
bash
Copy
Edit
cd dao-frontend
npm run dev
Visit: http://localhost:5173

🔮 Roadmap
Phase	Features
1	✅ Token minting & delegation
2	🧠 Governance logic with Governor & Timelock
3	💰 Treasury actions through proposals
4	🎨 Enhanced UI/UX (IPFS, ENS, proposal history)

📄 License
This project is licensed under the MIT License.
