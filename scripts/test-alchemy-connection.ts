import { ethers } from "hardhat";

async function main() {
  // Load environment variables
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  
  if (!rpcUrl) {
    console.log("❌ SEPOLIA_RPC_URL not found in environment variables");
    console.log("Please check your .env file");
    process.exit(1);
  }

  console.log("🔍 Testing Alchemy Sepolia connection...");
  console.log("RPC URL:", rpcUrl);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test connection by getting network info
    console.log("\n📡 Connecting to network...");
    const network = await provider.getNetwork();
    console.log("✅ Connected successfully!");
    console.log("Network Name:", network.name);
    console.log("Chain ID:", network.chainId);
    
    // Get latest block
    console.log("\n📊 Getting latest block...");
    const block = await provider.getBlock("latest");
    console.log("Latest Block Number:", block?.number);
    console.log("Block Timestamp:", new Date(block?.timestamp! * 1000).toLocaleString());
    
    // Get gas price
    console.log("\n⛽ Getting gas price...");
    const feeData = await provider.getFeeData();
    console.log("Gas Price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "Gwei");
    
    console.log("\n🎉 Alchemy connection test completed successfully!");
    console.log("You're ready to deploy to Sepolia testnet.");
    
  } catch (error) {
    console.log("❌ Failed to connect to Sepolia network!");
    console.log("Error:", error);
    console.log("\nTroubleshooting tips:");
    console.log("1. Check your Alchemy API key in the URL");
    console.log("2. Ensure the URL is correct:");
    console.log("   https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
    console.log("3. Verify your internet connection");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });