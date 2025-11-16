// Simple private key validation without external dependencies

// Load environment variables
require('dotenv').config();

console.log('Testing private key validation...\n');

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  console.log('❌ PRIVATE_KEY not found in environment variables');
  process.exit(1);
}

console.log('Private Key Length:', privateKey.length);
console.log('Starts with 0x:', privateKey.startsWith('0x'));

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
console.log('\n🎉 Private key validation passed!');