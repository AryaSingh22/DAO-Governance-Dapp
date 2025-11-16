# Pre-Deployment Checklist

## ✅ Critical Steps Before Deployment

### 1. Environment Configuration
- [ ] Open `.env` file
- [ ] Replace `YOUR_PRIVATE_KEY` with actual PRIVATE KEY for wallet 0x750BD4631d29B61b12D0E4441DA7000161060B79
- [ ] **Important**: Private key is NOT the same as wallet address!
- [ ] Private key must start with "0x" and be 64 hex characters long
- [ ] Verify `SEPOLIA_RPC_URL` is correct (already set to your Alchemy endpoint)
- [ ] Add your Etherscan API key

### 2. Validate Private Key
```bash
npx hardhat run scripts/validate-private-key.ts
```
- [ ] Private key validation passes

### 3. Test Alchemy Connection
```bash
npx hardhat run scripts/test-alchemy-connection.ts
```
- [ ] Successfully connects to Sepolia network
- [ ] Can retrieve latest block information

### 4. Verify Wallet Balance
- [ ] Wallet 0x750BD4631d29B61b12D0E4441DA7000161060B79 has Sepolia ETH (minimum 0.5 ETH recommended)
- [ ] Get more ETH from https://sepoliafaucet.com/ if needed

### 5. Final Setup Verification
```bash
npx hardhat run scripts/verify-setup.ts
```
- [ ] All environment variables are set
- [ ] Network connection successful
- [ ] Wallet initialization successful

## 🚀 Deployment Ready Checklist

### 6. Compile Contracts
```bash
npx hardhat compile --force
```
- [ ] All contracts compile without errors

### 7. Run Deployment
```bash
npx hardhat run scripts/deploy-testnet.ts --network sepolia
```

## 📋 Post-Deployment Actions

### 8. Verify Deployment Success
- [ ] All contracts deployed successfully
- [ ] Contract addresses displayed
- [ ] Etherscan verification completed

### 9. Save Contract Addresses
- [ ] GovernanceToken: 
- [ ] TimelockController: 
- [ ] MyGovernor: 
- [ ] Treasury: 
- [ ] MembershipNFT: 

### 10. Test Functionality
- [ ] Verify contracts on Etherscan
- [ ] Test basic governance proposal
- [ ] Test Treasury operations
- [ ] Test Membership NFT minting

## ⚠️ Important Security Reminders

- [ ] Never commit your `.env` file to version control
- [ ] Never share your private key
- [ ] Use the dedicated deployment wallet (0x750BD4631d29B61b12D0E4441DA7000161060B79)
- [ ] Keep your Etherscan API key secure
- [ ] Remember: Private key ≠ Wallet address!

## 🆘 Troubleshooting

If deployment fails:
1. Check wallet 0x750BD4631d29B61b12D0E4441DA7000161060B79 has sufficient Sepolia ETH
2. Verify private key format - run validation script
   - **Important**: Ensure you're using the PRIVATE KEY, not the WALLET ADDRESS
3. Confirm Alchemy endpoint is working - run connection test
4. Check Etherscan API key - ensure it's valid

## 📞 Support

For issues with deployment:
1. Review this checklist
2. Check Hardhat documentation
3. Verify all prerequisites are met
4. Consult Sepolia deployment guide
5. See `WALLET_ADDRESS_VS_PRIVATE_KEY.md` for detailed explanation