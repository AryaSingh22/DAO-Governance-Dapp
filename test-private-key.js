const ethers = require('ethers');

// Load environment variables
require('dotenv').config();

console.log('Testing private key validation...\n');

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  console.log('❌ PRIVATE_KEY not found in environment variables');
  process.exit(1);
}

console.log('Private Key:', privateKey);

// Check if it starts with 0x
if (!privateKey.startsWith('0x')) {
  console.log('❌ Private key must start with "0x"');
  process.exit(1);
}

// Check length (0x + 64 hex characters = 66 characters)
if (privateKey.length !== 66) {
  console.log(`❌ Private key has incorrect length. Expected 66 characters (0x + 64 hex chars), got ${privateKey.length}`);
  process.exit(1);
}

// Check if it's valid hex
const hexPart = privateKey.slice(2); // Remove 0x prefix
if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
  console.log('❌ Private key contains non-hexadecimal characters');
  process.exit(1);
}

console.log('✅ Private key format is valid');

try {
  // Try to create a wallet to double-check
  const wallet = new ethers.Wallet(privateKey);
  console.log('✅ Private key is valid and can create a wallet');
  console.log('Wallet Address:', wallet.address);
  
  // Check if this matches our expected deployment address
  if (wallet.address.toLowerCase() === '0x750BD4631d29B61b12D0E4441DA7000161060B79'.toLowerCase()) {
    console.log('✅ Private key matches deployment wallet address');
  } else {
    console.log('⚠️  Private key does not match deployment wallet address');
    console.log('Expected: 0x750BD4631d29B61b12D0E4441DA7000161060B79');
    console.log('Generated: ' + wallet.address);
    console.log('This may be intentional if you\'re using a different wallet.');
  }
} catch (error) {
  console.log('❌ Private key is invalid:', error.message);
  process.exit(1);
}

console.log('\n🎉 Private key validation passed!');