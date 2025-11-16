# Deployment Wallet Information

## Deployment Wallet Address
0x750BD4631d29B61b12D0E4441DA7000161060B79

This address is intended for deploying smart contracts to Sepolia testnet.

## Important Security Notes

⚠️ **DO NOT SHARE YOUR PRIVATE KEY** ⚠️

To deploy contracts using this address, you will need:
1. The private key corresponding to this address
2. Sufficient Sepolia ETH for gas fees (minimum 0.5 ETH recommended)

## Next Steps

1. Ensure this wallet has Sepolia ETH:
   - Visit https://sepoliafaucet.com/
   - Send ETH to the address above

2. Add the private key to your `.env` file:
   ```env
   PRIVATE_KEY=YOUR_PRIVATE_KEY_FOR_THIS_ADDRESS
   ```

3. Deploy to Sepolia:
   ```bash
   npx hardhat run scripts/deploy-testnet.ts --network sepolia
   ```