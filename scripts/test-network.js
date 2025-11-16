const { ethers } = require("hardhat");

async function main() {
  console.log("Testing Sepolia network connection...");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network);
  
  // Get account balance
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  console.log("Network test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });