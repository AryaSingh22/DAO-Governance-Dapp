# DAO Governance DApp

A decentralized autonomous organization (DAO) governance platform built on Ethereum.

## Features

- Token-based voting governance
- Proposal management system
- Treasury management
- NFT-based membership
- Research proposal submission and tracking

## Smart Contracts

The core contracts include:
- `DAORegistry`: Main registry for DAO members
- `GovernanceToken`: ERC20 token for voting power
- `MembershipNFT`: NFT-based access control
- `Treasury`: Multi-asset treasury management
- `ModularGovernor`: Flexible governance engine
- `ResearchRegistry`: Research proposal tracking
- `ReputationManager`: Contributor reputation system

## Frontend

Built with React + TypeScript, the frontend provides:
- Dashboard for governance overview
- Proposal creation and voting interface
- Research submission portal
- Reputation badge display
- Transaction status tracking

## Deployment

1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Run tests: `npm test`
4. Deploy locally: `npx hardhat node` and `npx hardhat ignition deploy ignition/modules/Governance.ts`
5. Start frontend: `cd dao-frontend && npm run dev`
