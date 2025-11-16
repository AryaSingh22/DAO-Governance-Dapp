# Sepolia Testnet Deployment Guide

## Prerequisites

Before deploying to Sepolia, you need to:

1. **Get Sepolia ETH**: 
   - Visit https://sepoliafaucet.com/ to get test ETH
   - You'll need at least 0.5 ETH for deployment
   - Send ETH to deployment wallet: 0x750BD4631d29B61b12D0E4441DA7000161060B79

2. **Set up Alchemy**:
   - You've already configured an Alchemy endpoint
   - Ensure it's set in your `.env` file

3. **Get Etherscan API Key**:
   - Create an account at https://etherscan.io/
   - Generate an API key for contract verification

## Environment Configuration

1. **Update the `.env` file** with your actual values:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TPEm35MLFwQi0x-AIFlzqfutetsbcUNG
   PRIVATE_KEY=YOUR_ACTUAL_PRIVATE_KEY_FOR_0x750BD4631d29B61b12D0E4441DA7000161060B79
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
   ```

2. **Private Key Requirements**:
   - Must start with "0x"
   - Must be exactly 64 hexadecimal characters long (32 bytes)
   - Example format: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
   - **Important**: This is NOT the same as your wallet address!
   - See `WALLET_ADDRESS_VS_PRIVATE_KEY.md` for detailed explanation

3. **Wallet Address vs Private Key**:
   - Wallet Address: `0x750BD4631d29B61b12D0E4441DA7000161060B79` (public, safe to share)
   - Private Key: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` (secret, never share)

## Deployment Process

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Compile contracts**:
   ```bash
   npx hardhat compile
   ```

3. **Run deployment script**:
   ```bash
   npx hardhat run scripts/deploy-testnet.ts --network sepolia
   ```

## What to Expect During Deployment

The deployment process will:

1. Deploy the following contracts in order:
   - GovernanceToken
   - TimelockController
   - MyGovernor
   - Treasury
   - MembershipNFT

2. Set up role permissions:
   - Grant proposer role to Governor
   - Grant executor role to ZeroAddress (allows anyone to execute)
   - Grant canceller role to Governor

3. Transfer ownership:
   - Treasury ownership to Timelock
   - MembershipNFT ownership to Timelock

4. Set guardian roles:
   - Treasury guardian to Governor
   - Governor guardian to deployer

5. Verify contracts on Etherscan

6. Update frontend configuration with contract addresses

## Troubleshooting

### Common Issues

1. **Insufficient Funds**:
   - Error: "insufficient funds for gas * price + value"
   - Solution: Get more Sepolia ETH from the faucet for address 0x750BD4631d29B61b12D0E4441DA7000161060B79

2. **Invalid Private Key**:
   - Error: "malformed value provided for key 'accounts'" or "private key too short"
   - Solution: Ensure your private key starts with "0x" and is 64 characters long
   - **Important**: The private key is NOT the same as your wallet address!

3. **RPC Connection Issues**:
   - Error: "could not detect network"
   - Solution: Check your Alchemy URL and ensure it's for Sepolia

4. **Verification Failures**:
   - Contracts deploy successfully but verification fails
   - Solution: Check your Etherscan API key or manually verify later

### Manual Verification

If automatic verification fails, you can manually verify contracts:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Constructor Argument 1" "Constructor Argument 2"
```

## Post-Deployment

After successful deployment:

1. Check the console output for contract addresses
2. Verify contracts appear on Sepolia Etherscan
3. Test basic functionality through the frontend
4. Save the contract addresses for future reference

## Contract Addresses

The deployment script will output addresses in this format:
```
=== CONTRACT ADDRESSES ===
GovernanceToken: 0x...
TimelockController: 0x...
MyGovernor: 0x...
Treasury: 0x...
MembershipNFT: 0x...
```

Keep these addresses safe as you'll need them to interact with your DAO.