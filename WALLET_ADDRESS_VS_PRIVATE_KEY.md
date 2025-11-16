# Wallet Address vs Private Key

## Understanding the Difference

### Wallet Address
- **Format**: 42 characters starting with "0x" followed by 40 hexadecimal characters
- **Example**: `0x750BD4631d29B61b12D0E4441DA7000161060B79`
- **Purpose**: Public identifier for your wallet, safe to share
- **Usage**: Used to receive funds and identify your wallet

### Private Key
- **Format**: 66 characters starting with "0x" followed by 64 hexadecimal characters
- **Example**: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- **Purpose**: Secret key that proves ownership of the wallet
- **Usage**: Required to sign transactions and deploy contracts
- **Security**: NEVER share this with anyone

## Common Mistakes

1. **Using Address as Private Key**: 
   - ❌ `PRIVATE_KEY=0x750BD4631d29B61b12D0E4441DA7000161060B79`
   - ✅ `PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

2. **Missing "0x" Prefix**:
   - ❌ `PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
   - ✅ `PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

3. **Incorrect Length**:
   - ❌ `PRIVATE_KEY=0x1234567890abcdef` (too short)
   - ✅ `PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` (64 chars + 0x)

## How to Get Your Private Key

### From MetaMask
1. Open MetaMask
2. Select the wallet with address `0x750BD4631d29B61b12D0E4441DA7000161060B79`
3. Click the three dots menu
4. Select "Account Details"
5. Click "Export Private Key"
6. Enter your password
7. Copy the private key (64 hex characters with 0x prefix)

### From Other Wallets
- Follow similar steps in your wallet application
- Look for "Export Private Key" or "Reveal Private Key" options
- Always ensure you're in a secure environment

## Security Best Practices

1. **Never commit private keys to version control**
2. **Use a dedicated test wallet for development**
3. **Store private keys in secure password managers**
4. **Never share private keys in chat, email, or documents**
5. **Regenerate wallets if you suspect a key has been compromised**

## Validation

You can validate your private key format using:
```bash
npx hardhat run scripts/validate-private-key.ts
```

This script will check:
- Correct "0x" prefix
- Proper length (66 characters total)
- Valid hexadecimal characters
- Ability to create a wallet from the key