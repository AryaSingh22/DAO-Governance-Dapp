# 🏛️ DAO Governance DApp

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-username/dao-governance-dapp)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://github.com/your-username/dao-governance-dapp)
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-blue)](https://soliditylang.org/)

A full-stack Decentralized Autonomous Organization (DAO) Governance DApp with advanced features including quadratic voting, proposal metadata, NFT-based membership, and multi-asset treasury management.

## 📖 Project Overview

This DAO Governance DApp enables decentralized decision-making through a comprehensive governance system with the following key features:

### 🔑 Core Components

<details>
<summary>Click to expand component details</summary>

- **GovernanceToken**: ERC20Votes token with delegation and permit functionality
- **MyGovernor**: Enhanced Governor contract with proposal metadata and quadratic voting support
- **TimelockController**: Security layer for proposal execution delays
- **Treasury**: Advanced treasury with ETH/ERC20/ERC721/ERC1155 support and streaming payments
- **MembershipNFT**: NFT-based DAO membership representation

</details>

### 🌟 Key Features

- [x] **Token-based Voting**: Delegated voting power with snapshot mechanisms
- [x] **Quadratic Voting**: Enhanced governance with quadratic voting support
- [x] **Proposal Metadata**: Rich proposal information with title, description, IPFS CID, and categories
- [x] **NFT-based Membership**: Membership verification through NFTs
- [x] **Multi-Asset Treasury**: Support for ETH, ERC20, ERC721, and ERC1155 assets
- [x] **Streaming Payments**: Time-based payment distributions
- [x] **Emergency Controls**: Guardian roles for proposal cancellation
- [x] **Analytics Dashboard**: Proposal history and voting metrics

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

### Proposal Creation Flow

```tsx
// Example: Creating a proposal with metadata
const targets = [treasuryAddress];
const values = [0n];
const calldata = treasuryInterface.encodeFunctionData("releaseETH", [
  recipientAddress,
  ethers.parseEther("1")
]);
const title = "Release 1 ETH to Community Fund";
const description = "Proposal to release 1 ETH to the community fund for development grants";
const ipfsCID = "QmExampleCID";
const category = 1; // Protocol category

await governor.proposeWithMetadata(
  targets,
  values,
  [calldata],
  title,
  description,
  ipfsCID,
  category
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
  Built with ❤️ by the DAO Community
</p>