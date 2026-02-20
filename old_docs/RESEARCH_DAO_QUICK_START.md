# ResearchDAO Quick Start Guide

This guide provides a quick overview of how to set up, run, and develop with the ResearchDAO codebase.

## Prerequisites

- Node.js v18+
- NPM
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dao
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd dao-frontend
npm install
cd ..
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Test Suites

```bash
# Run ResearchRegistry tests
npm run test:research

# Run ReputationManager tests
npm run test:reputation

# Run tests with coverage report
npm run test:coverage
```

## Local Development

### 1. Start Local Blockchain

```bash
npx hardhat node
```

### 2. Deploy Contracts

In a new terminal:

```bash
npx hardhat ignition deploy ignition/modules/Governance.ts --network localhost
```

### 3. Update Frontend Configuration

Update `dao-frontend/src/config/contracts.ts` with the deployed contract addresses.

### 4. Run Frontend

```bash
cd dao-frontend
npm run dev
```

## Project Structure

```
DAO/
├── contracts/              # Smart contracts
├── test/                   # Unit and integration tests
├── dao-frontend/           # React frontend
├── ignition/               # Deployment scripts
├── scripts/                # Utility scripts
├── artifacts/              # Compiled contracts
├── cache/                  # Hardhat cache
└── typechain-types/        # TypeScript contract types
```

## Key Smart Contracts

### ResearchRegistry.sol
- Manages research paper submissions
- Handles IPFS CID storage and SHA256 verification
- Implements submission fees and approval workflow

### ReputationManager.sol
- Tracks user contributions and awards NFT badges
- Implements points system for submissions, votes, and reviews
- Manages progressive badge tiers

### MyGovernor.sol (Enhanced)
- Extended governance with research category
- Paper linking functionality for proposals
- Integration with reputation system

### Treasury.sol (Enhanced)
- Research funding through streaming payments
- Multi-asset treasury management
- Vesting schedules for research grants

## Frontend Components

### ResearchSubmission.tsx
- Form for submitting research papers
- IPFS CID and SHA256 hash input
- Submission fee display

### ResearchArchive.tsx
- Filterable research paper archive
- Paper details display
- Status indicators

### ReputationBadges.tsx
- User reputation dashboard
- Badge display and details
- Points breakdown

## Development Workflow

### 1. Modify Contracts
- Make changes to contracts in `contracts/` directory
- Update corresponding tests in `test/` directory

### 2. Update Tests
- Add new tests for modified functionality
- Ensure 100% coverage for new code

### 3. Compile and Test
```bash
npx hardhat compile
npm run test
```

### 4. Update Frontend
- Modify components in `dao-frontend/src/components/`
- Update contract ABIs in `dao-frontend/src/config/contracts.ts`

### 5. Test Integration
- Run local blockchain and deploy contracts
- Test frontend functionality

## Useful Commands

### Hardhat Commands
```bash
# Compile contracts
npx hardhat compile

# Run local blockchain
npx hardhat node

# Deploy contracts
npx hardhat ignition deploy ignition/modules/Governance.ts --network localhost

# Run tests
npx hardhat test

# Generate coverage report
npx hardhat coverage

# Verify contracts (for testnets)
npx hardhat verify --network sepolia <contract-address>
```

### Frontend Commands
```bash
# Navigate to frontend directory
cd dao-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Configuration Files

### hardhat.config.ts
- Hardhat configuration including Solidity settings
- Network configurations
- TypeChain settings

### package.json
- Project dependencies and scripts
- Test scripts for specific contracts

### dao-frontend/src/config/contracts.ts
- Contract addresses and ABIs
- Frontend contract integration configuration

## Testing Guidelines

### Writing Tests
- Use Hardhat's testing framework with Chai assertions
- Test both success and failure cases
- Use fixtures for efficient test setup
- Mock external dependencies when necessary

### Test Coverage
- Aim for 100% coverage on new code
- Test edge cases and error conditions
- Validate event emissions
- Test cross-contract interactions

## Documentation

### Key Documentation Files
- `README.md` - Project overview and setup instructions
- `RESEARCH_DAO_DOCUMENTATION.md` - Comprehensive technical documentation
- `RESEARCH_DAO_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `PROJECT_ROADMAP.md` - Development roadmap
- `SECURITY_AUDIT.md` - Security considerations

## Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Run `npx hardhat clean` and recompile
   - Check Solidity version compatibility

2. **Test Failures**
   - Ensure local blockchain is running
   - Check contract addresses in configuration
   - Verify test accounts have sufficient funds

3. **Frontend Connection Issues**
   - Verify MetaMask is connected to correct network
   - Check contract addresses in `contracts.ts`
   - Ensure local blockchain is running

4. **Deployment Issues**
   - Verify network configuration in `hardhat.config.ts`
   - Check account balances and private keys
   - Ensure sufficient gas for deployment

### Getting Help
- Review documentation files
- Check test files for usage examples
- Examine existing contract implementations
- Refer to Hardhat and Ethers.js documentation

## Next Steps

1. **Explore the Codebase**
   - Review smart contract implementations
   - Examine frontend components
   - Study test files for usage patterns

2. **Run the Application**
   - Deploy contracts locally
   - Test all functionality
   - Verify integration between components

3. **Contribute**
   - Fork the repository
   - Implement new features
   - Submit pull requests with comprehensive tests

This quick start guide should help you get up and running with the ResearchDAO codebase quickly. For more detailed information, refer to the comprehensive documentation files in the repository.