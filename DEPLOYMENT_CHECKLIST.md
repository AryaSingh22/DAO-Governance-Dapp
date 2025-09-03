# Testnet Deployment Checklist

## Pre-Deployment

### 1. Environment Setup
- [ ] Install Node.js v18+
- [ ] Install project dependencies: `npm install`
- [ ] Install frontend dependencies: `cd dao-frontend && npm install`
- [ ] Configure environment variables in `.env` file:
  ```
  GOERLI_RPC_URL=your_rpc_url
  PRIVATE_KEY=your_private_key
  ETHERSCAN_API_KEY=your_etherscan_api_key
  ```

### 2. Contract Verification
- [ ] Review all contract code for potential issues
- [ ] Run local tests: `npm run test`
- [ ] Check test coverage: `npm run test:coverage`
- [ ] Perform static analysis with Slither or similar tools

### 3. Configuration Review
- [ ] Verify deployment parameters in `scripts/deploy-testnet.ts`
- [ ] Check governance parameters (voting delay, period, quorum)
- [ ] Confirm timelock delay is appropriate for testnet
- [ ] Review membership NFT parameters

## Deployment Process

### 1. Network Configuration
- [ ] Add network configuration to `hardhat.config.ts`:
  ```typescript
  goerli: {
    url: process.env.GOERLI_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
  ```

### 2. Contract Deployment
- [ ] Deploy contracts: `npx hardhat run scripts/deploy-testnet.ts --network goerli`
- [ ] Note contract addresses from deployment output
- [ ] Verify contracts on Etherscan (automatically done by script)

### 3. Role Configuration
- [ ] Confirm Timelock roles are properly set:
  - PROPOSER_ROLE granted to Governor
  - EXECUTOR_ROLE granted to ZeroAddress
  - CANCELLER_ROLE granted to Governor
- [ ] Verify Treasury ownership transferred to Timelock
- [ ] Verify MembershipNFT ownership transferred to Timelock
- [ ] Confirm Guardian roles are set correctly

### 4. Frontend Integration
- [ ] Update contract addresses in `dao-frontend/src/config/contracts.ts`
- [ ] Verify ABI imports are correct
- [ ] Test frontend connection to deployed contracts

## Post-Deployment Verification

### 1. Contract Functionality
- [ ] Test token minting functionality
- [ ] Verify delegation and voting power calculations
- [ ] Test proposal creation with metadata
- [ ] Execute full governance flow (propose → vote → queue → execute)
- [ ] Test emergency controls (guardian cancellation)
- [ ] Verify Treasury operations (ETH/ERC20 transfers)
- [ ] Test Membership NFT minting and burning

### 2. Frontend Testing
- [ ] Connect MetaMask to testnet
- [ ] Test wallet connection functionality
- [ ] Verify token balance display
- [ ] Test proposal creation form
- [ ] Execute voting functionality
- [ ] Test governance actions (queue, execute)
- [ ] Verify dashboard analytics

### 3. Security Checks
- [ ] Verify ownership transfers were successful
- [ ] Confirm role assignments are correct
- [ ] Test access controls for admin functions
- [ ] Verify timelock delays are functioning
- [ ] Test emergency pause functionality

## Verification Commands

### Contract Addresses
```bash
# Get contract addresses
npx hardhat run scripts/deploy-testnet.ts --network goerli
```

### Role Verification
```bash
# Check Timelock roles
npx hardhat console --network goerli
> const timelock = await ethers.getContractAt("TimelockController", "TIMELOCK_ADDRESS")
> const PROPOSER_ROLE = await timelock.PROPOSER_ROLE()
> await timelock.hasRole(PROPOSER_ROLE, "GOVERNOR_ADDRESS")
```

### Governance Testing
```bash
# Test proposal creation
npx hardhat console --network goerli
> const governor = await ethers.getContractAt("MyGovernor", "GOVERNOR_ADDRESS")
> const token = await ethers.getContractAt("GovernanceToken", "TOKEN_ADDRESS")
> await token.delegate("YOUR_ADDRESS")
> await governor.propose([target], [value], [calldata], "Test proposal")
```

## Troubleshooting

### Common Issues
1. **Insufficient funds**: Ensure deployer account has enough ETH for gas
2. **Role configuration errors**: Verify all roles are properly assigned
3. **Frontend connection issues**: Check contract addresses and network configuration
4. **Verification failures**: Ensure Etherscan API key is correct and contracts are compiled

### Useful Commands
```bash
# Check account balance
npx hardhat run scripts/check-balance.ts --network goerli

# Reset deployment (if needed)
npx hardhat clean
npx hardhat compile

# Run specific tests
npx hardhat test test/GovernanceToken.test.ts
```

## Next Steps
- [ ] Document deployed contract addresses
- [ ] Share with team for testing
- [ ] Prepare mainnet deployment plan
- [ ] Schedule security audit