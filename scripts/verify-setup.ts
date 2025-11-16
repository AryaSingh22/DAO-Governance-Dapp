import { ethers } from "hardhat";

// Load environment variables
require("dotenv").config();

async function main() {
  console.log("🔍 Verifying deployment setup...\n");

  // Check environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const etherscanKey = process.env.ETHERSCAN_API_KEY;

  console.log("Environment Variables Check:");
  console.log("✅ PRIVATE_KEY:", privateKey ? "Set" : "❌ Missing");
  console.log("✅ SEPOLIA_RPC_URL:", rpcUrl ? "Set" : "❌ Missing");
  console.log("✅ ETHERSCAN_API_KEY:", etherscanKey ? "Set" : "❌ Missing");

  if (!privateKey || !rpcUrl) {
    console.log("\n❌ Critical environment variables missing!");
    console.log("Please update your .env file with the required values.");
    process.exit(1);
  }

  // Validate private key format
  if (privateKey && (!privateKey.startsWith("0x") || privateKey.length !== 66)) {
    console.log("\n❌ Invalid private key format!");
    console.log("Private key should start with '0x' and be 64 characters long.");
    process.exit(1);
  }

  // Test network connection
  try {
    console.log("\n📡 Testing Alchemy Sepolia connection...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name, "(Chain ID:", network.chainId, ")");
    
    // Get latest block as additional verification
    const block = await provider.getBlock("latest");
    console.log("Latest Block Number:", block?.number);
  } catch (error) {
    console.log("❌ Failed to connect to Sepolia network!");
    console.log("Please check your SEPOLIA_RPC_URL in the .env file.");
    process.exit(1);
  }

  // Test wallet
  try {
    console.log("\n🔐 Testing wallet...");
    const wallet = new ethers.Wallet(privateKey);
    console.log("✅ Wallet address:", wallet.address);
    
    // Check balance
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Wallet balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("⚠️  Warning: Wallet has zero balance. Please add Sepolia ETH.");
    }
  } catch (error) {
    console.log("❌ Failed to initialize wallet!");
    console.log("Please check your PRIVATE_KEY in the .env file.");
    process.exit(1);
  }

  console.log("\n✅ Setup verification complete!");
  console.log("You're ready to deploy to Sepolia testnet.");
  console.log("\nTo deploy, run:");
  console.log("npx hardhat run scripts/deploy-testnet.ts --network sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });