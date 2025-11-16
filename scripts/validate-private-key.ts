import { ethers } from "hardhat";

function validatePrivateKey(privateKey: string | undefined): boolean {
  if (!privateKey) {
    console.log("❌ Private key is undefined or empty");
    return false;
  }

  // Check if it starts with 0x
  if (!privateKey.startsWith("0x")) {
    console.log("❌ Private key must start with '0x'");
    return false;
  }

  // Check length (0x + 64 hex characters = 66 characters)
  if (privateKey.length !== 66) {
    console.log(`❌ Private key has incorrect length. Expected 66 characters (0x + 64 hex chars), got ${privateKey.length}`);
    console.log("💡 Note: The private key is NOT the same as your wallet address!");
    console.log("💡 Wallet address example: 0x750BD4631d29B61b12D0E4441DA7000161060B79 (42 chars)");
    console.log("💡 Private key example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef (66 chars)");
    return false;
  }

  // Check if it's valid hex
  const hexPart = privateKey.slice(2); // Remove 0x prefix
  if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
    console.log("❌ Private key contains non-hexadecimal characters");
    return false;
  }

  console.log("✅ Private key format is valid");
  return true;
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  
  console.log("🔍 Validating private key format...\n");
  
  if (validatePrivateKey(privateKey)) {
    try {
      // Try to create a wallet to double-check
      if (privateKey) {
        const wallet = new ethers.Wallet(privateKey);
        console.log("✅ Private key is valid and can create a wallet");
        console.log("Wallet Address:", wallet.address);
        
        // Check if this matches our expected deployment address
        if (wallet.address.toLowerCase() === "0x750BD4631d29B61b12D0E4441DA7000161060B79".toLowerCase()) {
          console.log("✅ Private key matches deployment wallet address");
        } else {
          console.log("⚠️  Private key does not match deployment wallet address");
          console.log("Expected: 0x750BD4631d29B61b12D0E4441DA7000161060B79");
          console.log("Generated: " + wallet.address);
          console.log("This may be intentional if you're using a different wallet.");
        }
      }
    } catch (error) {
      console.log("❌ Private key is invalid:", error);
      return false;
    }
  } else {
    console.log("\n🔧 To fix this issue:");
    console.log("1. Open your .env file");
    console.log("2. Replace YOUR_PRIVATE_KEY with your actual private key");
    console.log("3. Ensure it starts with '0x' and is 64 hex characters long");
    console.log("4. Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    console.log("\n💡 Important: The private key is NOT the same as your wallet address!");
    console.log("See WALLET_ADDRESS_VS_PRIVATE_KEY.md for detailed explanation.");
    return false;
  }
  
  return true;
}

main()
  .then((isValid) => {
    if (isValid) {
      console.log("\n🎉 Private key validation passed!");
    } else {
      console.log("\n❌ Private key validation failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });