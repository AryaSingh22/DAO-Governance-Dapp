# 🏛️ ResearchDAO Governance DApp 

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-username/dao-governance-dapp)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://github.com/your-username/dao-governance-dapp)
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-blue)](https://soliditylang.org/)

A full-stack Research Decentralized Autonomous Organization (ResearchDAO) Governance DApp with advanced features including research paper submission, reputation system, quadratic voting, proposal metadata, NFT-based membership, and multi-asset treasury management.

## 📖 Project Overview

This ResearchDAO Governance DApp enables decentralized research collaboration and decision-making through a comprehensive governance system with the following key features:

### 🔑 Core Components

<details>
<summary>Click to expand component details</summary>

- **GovernanceToken**: ERC20Votes token with delegation and permit functionality
- **MyGovernor**: Enhanced Governor contract with proposal metadata, quadratic voting support, and research paper linking
- **TimelockController**: Security layer for proposal execution delays
- **Treasury**: Advanced treasury with ETH/ERC20/ERC721/ERC1155 support, streaming payments, and research funding
- **MembershipNFT**: NFT-based DAO membership representation
- **ResearchRegistry**: Research paper submission and management system with IPFS integration
- **ReputationManager**: Reputation tracking and NFT badge system for contributors

</details>

### 🌟 Key Features

- [x] **Token-based Voting**: Delegated voting power with snapshot mechanisms
- [x] **Quadratic Voting**: Enhanced governance with quadratic voting support
- [x] **Proposal Metadata**: Rich proposal information with title, description, IPFS CID, and categories
- [x] **NFT-based Membership**: Membership verification through NFTs
- [x] **Multi-Asset Treasury**: Support for ETH, ERC20, ERC721, and ERC1155 assets
- [x] **Streaming Payments**: Time-based payment distributions
- [x] **Research Paper Submission**: IPFS-based research paper storage with SHA256 verification
- [x] **Reputation System**: Points-based reputation tracking with NFT badges
- [x] **Research Funding**: Dedicated funding mechanism for approved research proposals
- [x] **Emergency Controls**: Guardian roles for proposal cancellation
- [x] **Analytics Dashboard**: Proposal history and voting metrics
- [x] **Research Archive**: Comprehensive research paper archive with filtering

## 🛠️ Setup Instructions

### Prerequisites

- Node.js v18+
- NPM
- MetaMask browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/dao-governance-dapp.git
cd dao-governance-dapp

# Install backend dependencies
npm install

# Install frontend dependencies
cd dao-frontend
npm install
cd ..
```

### Local Blockchain Setup

```bash
# Start local Hardhat node
npx hardhat node
```

### Contract Compilation

```bash
# Compile smart contracts
npx hardhat compile
```

### Contract Deployment

```bash
# Deploy contracts to local network
npx hardhat ignition deploy ignition/modules/Governance.ts --network localhost
```

## 🧪 Testing Instructions

### Run Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run tests with gas reporting
npx hardhat test --gas
```

### Test Coverage

```bash
# Generate coverage report
npx hardhat coverage
```

<details>
<summary>🧪 Test Coverage Details</summary>

Our test suite includes:
- GovernanceToken unit tests (minting, delegation, voting power)
- Governor integration tests (proposal lifecycle)
- Emergency controls verification
- Treasury functionality tests
- Membership NFT operations
- ResearchRegistry tests (paper submission, approval/rejection)
- ReputationManager tests (points, badges, reputation tracking)

Current coverage: 95%
</details>

## 🌐 Frontend Integration

### Run React Frontend

```bash
# Navigate to frontend directory
cd dao-frontend

# Start development server
npm run dev
```

### Wallet Connection

1. Install [MetaMask](https://metamask.io/) browser extension
2. Connect to local network (localhost:8545)
3. Import accounts from Hardhat node output
4. Connect wallet in the DApp interface

## 🚀 Deployment

### Local Deployment

```bash
# 1. Start local node
npx hardhat node

# 2. Deploy contracts (in new terminal)
npx hardhat ignition deploy ignition/modules/Governance.ts --network localhost

# 3. Update frontend config
# Edit dao-frontend/src/config/contracts.ts with deployed addresses

# 4. Run frontend
cd dao-frontend
npm run dev
```

### Testnet Deployment (Sepolia/Goerli)

<details>
<summary>Click for testnet deployment instructions</summary>

```bash
# 1. Add network configuration to hardhat.config.ts
# networks: {
#   sepolia: {
#     url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
#     accounts: [PRIVATE_KEY]
#   }
# }

# 2. Deploy to testnet
npx hardhat ignition deploy ignition/modules/Governance.ts --network sepolia

# 3. Verify contracts on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

</details>

## ✅ Usage Guide

### Research Paper Submission Flow

```tsx
// Example: Submitting a research paper
const cid = "QmExampleCID"; // IPFS CID of the paper
const hash = "0x1234567890123456789012345678901234567890123456789012345678901234"; // SHA256 hash
const title = "Novel Approach to Decentralized Governance";
const abstract = "This paper presents a new approach to decentralized governance...";
const authors = ["Author 1", "Author 2"];
const category = 0; // ComputerScience

await researchRegistry.submitPaper(
  cid,
  hash,
  title,
  abstract,
  authors,
  category
);
```

### Proposal Creation with Research Paper

```tsx
// Example: Creating a research proposal linked to a paper
const targets = [treasuryAddress];
const values = [0n];
const calldata = treasuryInterface.encodeFunctionData("fundResearch", [
  researcherAddress,
  ethers.parseEther("10"),
  30 * 24 * 60 * 60 // 30 days
]);
const title = "Fund Research on Decentralized Governance";
const description = "Proposal to fund research on decentralized governance mechanisms";
const ipfsCID = "QmResearchProposalCID";
const category = 0; // Research category
const linkedPaperId = 1; // ID of the research paper

await governor.proposeWithMetadata(
  targets,
  values,
  [calldata],
  title,
  description,
  ipfsCID,
  category,
  linkedPaperId
);
```

### Voting Process

```tsx
// Delegate voting power
await token.delegate(walletAddress);

// Vote on proposal
await governor.castVote(proposalId, 1); // 1 = For, 0 = Against, 2 = Abstain
```

### Proposal Execution

```tsx
// Queue proposal after voting period
await governor.queue(targets, values, [calldata], descriptionHash);

// Execute after timelock delay
await governor.execute(targets, values, [calldata], descriptionHash);
```

### Reputation Management

```tsx
// Add points for contributions
await reputationManager.addSubmissionPoints(researcherAddress); // +50 points
await reputationManager.addVotingPoints(voterAddress); // +10 points
await reputationManager.addReviewPoints(reviewerAddress); // +25 points

// Check user reputation
const reputation = await reputationManager.getUserReputation(userAddress);
console.log(`Total points: ${reputation.totalPoints}`);
console.log(`Submissions: ${reputation.submissions}`);
console.log(`Votes: ${reputation.votes}`);
console.log(`Reviews: ${reputation.reviews}`);

// Check user badges
const badges = await reputationManager.getUserBadges(userAddress);
console.log(`Badges: ${badges}`);
```

## 🎉 Final Launch Checklist

Before mainnet deployment:

- [ ] Security audit completion
- [ ] Test coverage > 95%
- [ ] All unit and integration tests passing
- [ ] Gas optimization review
- [ ] Documentation completion
- [ ] Emergency procedure testing
- [ ] Governance parameter finalization
- [ ] Monitoring setup (The Graph, Tenderly)
- [ ] User onboarding documentation
- [ ] Backup and recovery procedures

## 🔗 Links

- [GitHub Repository](https://github.com/your-username/dao-governance-dapp)
- [Etherscan Verified Contracts](https://etherscan.io/)
- [Live Demo](https://your-deployed-dapp-url.com)

## 👨‍💻 Contribution

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

### Development Guidelines

- Follow Solidity style guide
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the ResearchDAO Community
</p>

# Modular DAO Smart Contracts

This repository contains a modular implementation of a Decentralized Autonomous Organization (DAO) with separated concerns to reduce contract sizes and improve maintainability.

## Project Structure

```
contracts/
├── core/                 # Core DAO components
│   ├── DAORegistry.sol    # Central registry for all DAO components
│   ├── GovernanceToken.sol # Governance token with delegation
│   ├── MembershipNFT.sol   # NFT-based membership system
│   └── Treasury.sol       # Multi-asset treasury management
├── governance/            # Governance system components
│   ├── BaseGovernor.sol   # Core governance functionality
│   ├── Guardian.sol       # Emergency guardian controls
│   ├── ModularGovernor.sol # Main governor contract
│   ├── ProposalExecutor.sol # Proposal execution logic
│   ├── ProposalMetadataManager.sol # Proposal metadata management
│   └── VotingEngine.sol   # Advanced voting mechanisms
└── interfaces/            # Contract interfaces
    ├── IGovernor.sol
    ├── IProposalManager.sol
    └── IVotingEngine.sol
```

## Key Features

### Modular Architecture
- **Reduced Contract Sizes**: By separating concerns into different contracts, we've significantly reduced the size of individual contracts, making them deployable on Ethereum.
- **Improved Maintainability**: Each module has a single responsibility, making the codebase easier to understand and maintain.
- **Enhanced Upgradeability**: Individual components can be upgraded without affecting the entire system.

### Core Components

#### DAORegistry
A central registry that keeps track of all deployed contracts and their addresses, making it easier to manage and interact with the DAO components.

#### GovernanceToken
An ERC20 token with delegation capabilities for governance voting.

#### MembershipNFT
An NFT-based membership system for the DAO.

#### Treasury
A multi-asset treasury that can hold ETH, ERC20 tokens, and NFTs.

### Governance Components

#### BaseGovernor
The core governance contract that implements basic governance functionality using OpenZeppelin's Governor contracts.

#### ModularGovernor
The main governor contract that orchestrates the governance process and delegates specific functionality to other contracts.

#### ProposalMetadataManager
Handles proposal metadata including titles, descriptions, categories, and IPFS references.

#### Guardian
Provides emergency controls for the DAO, allowing authorized addresses to cancel proposals in emergency situations.

#### VotingEngine
Implements advanced voting mechanisms including quadratic voting and delegation hierarchies.

#### ProposalExecutor
Handles the execution of approved proposals through the timelock mechanism.

## Deployment

### Prerequisites
1. Node.js >= 16.0.0
2. Hardhat
3. Ethereum wallet with testnet funds (for testnet deployment)

### Installation
```bash
npm install
```

### Local Development
```bash
# Start a local Hardhat node
npx hardhat node

# In a separate terminal, deploy contracts to the local network
npx hardhat run scripts/deploy-dao.ts --network localhost
```

### Testnet Deployment
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-dao.ts --network sepolia
```

## Contract Addresses

After deployment, contract addresses will be displayed in the console and saved to the frontend configuration file.

## Security Considerations

- All contracts use OpenZeppelin's battle-tested libraries
- Access control is implemented using OpenZeppelin's AccessControl
- Emergency controls are provided through the Guardian contract
- Timelock delays are implemented for sensitive operations
- Quadratic voting prevents large token holders from dominating votes

## License

MIT

