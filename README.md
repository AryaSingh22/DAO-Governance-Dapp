🏛️ Full-Stack DAO Governance Platform
This is a complete full-stack Decentralized Autonomous Organization (DAO) Governance DApp, structured as a monorepo. It contains both the Solidity smart contracts (backend) and the React-based frontend.

✨ Features
This first phase implements the foundational layer of a DAO:

Wallet Connection: Securely connect with MetaMask.

Token Minting: A simple interface to mint new governance tokens for testing.

Balance Viewing: Real-time display of token balance and voting power.

Vote Delegation: A crucial one-click action to delegate voting power to any address (including your own).

Screenshot of the running application:
(You should replace this URL with a link to your own screenshot!)

🧱 Tech Stack
Backend (/)
Solidity – Smart contract development

Hardhat – Ethereum development environment

OpenZeppelin Contracts – Secure, audited base contracts for ERC20Votes

Ethers.js – Blockchain interaction library

TypeScript – Safer scripting and deployment

Frontend (/dao-frontend)
React – UI framework

Vite – Fast frontend bundler and dev server

TypeScript – End-to-end type safety

Tailwind CSS – Utility-first styling for a modern UI

Ethers.js (v6) – Web3 interactions

🗂️ Project Structure
/
├── contracts/          # Solidity smart contracts
├── ignition/           # Hardhat deployment modules
├── dao-frontend/       # The entire React frontend application
│   ├── src/
│   └── package.json
├── hardhat.config.ts   # Hardhat configuration
├── .gitignore
└── package.json        # Backend dependencies

🚀 Getting Started
📋 Prerequisites
Node.js v18+

NPM

MetaMask Browser Extension

📦 Installation & Setup
Clone the repository and install all dependencies for both the backend and frontend.

git clone https://github.com/AryaSingh22/DAO-Governance-Dapp.git
cd DAO-Governance-Dapp

# Install backend dependencies
npm install

# Install frontend dependencies
cd dao-frontend
npm install
cd ..

🔧 1. Start the Local Blockchain
Keep this terminal running — it's your local blockchain.

npx hardhat node

📤 2. Deploy the Smart Contract
In a second terminal:

npx hardhat run ignition/modules/Lock.ts --network localhost

Copy the new contract address from the terminal output.

🖥️ 3. Configure the Frontend
Open dao-frontend/src/App.tsx.

Replace the value of GOVERNANCE_TOKEN_ADDRESS with the new contract address you just copied.

🦊 4. Configure MetaMask
First, add the local Hardhat network:

Network Name: Hardhat Localhost

RPC URL: http://127.0.0.1:8545

Chain ID: 31337

Currency Symbol: ETH

Next, import the deployer account:

Use the private key of Account #0 from the npx hardhat node terminal to import a new account into MetaMask.

🧪 5. Run the Frontend
In a third terminal:

cd dao-frontend
npm run dev

Your app will be live at: http://localhost:5173

🛣️ Future Improvements
Phase 2 – Core Governance: Implement Governor and Timelock contracts for proposal creation, voting, and execution.

Phase 3 – Treasury Management: Create proposals that can execute on-chain transactions, such as ETH transfers from a treasury.

Phase 4 – UI/UX Enhancements: Add support for ENS names and use IPFS for storing detailed proposal metadata.

🙌 Acknowledgements
This project stands on the shoulders of giants. A huge thank you to the teams behind these incredible tools:

OpenZeppelin

Hardhat

Ethers.js

React

Tailwind CSS

📄 License
This project is licensed under the MIT License.
